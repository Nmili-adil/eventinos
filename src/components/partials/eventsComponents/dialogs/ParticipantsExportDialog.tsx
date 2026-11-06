import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowDown, ArrowUp, GripVertical, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createExportPresetApi,
  deleteExportPresetApi,
  exportEventParticipantsApi,
  fetchExportPresetsApi,
  fetchParticipantExportFieldsApi,
} from "@/api/exportApi"
import { participantExportSchema, type ParticipantExportFormData } from "@/schema/exportSchema"
import { downloadBlob, readBlobErrorMessage } from "@/lib/helperFunctions"
import { getExportPreferences, setExportPreferences } from "@/services/localStorage"
import type {
  ExportField,
  ExportFieldGroup,
  ExportFilters,
  ExportPreset,
  ParticipantExportParams,
} from "@/types/exportTypes"

const GROUP_ORDER: ExportFieldGroup[] = ["identity", "contact", "registration", "profile", "attendance"]
const PREVIEW_ROWS = 5
const FALLBACK_STATUSES = ["PENDING", "ACCEPTED", "REFUSED", "EXPIRED"]

interface ParticipantsExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  participants: any[]
}

// Participants hold their details either directly or under `member`.
const readParticipantValue = (participant: any, key: string): unknown => {
  const source = { ...participant?.member, ...participant }
  if (key === "fullName") {
    return [source.firstName, source.lastName].filter(Boolean).join(" ") || source.fullName
  }
  if (key === "registeredAt") return source.registeredAt ?? source.createdAt
  return source[key]
}

const formatPreviewValue = (value: unknown, yes: string, no: string): string => {
  if (value === undefined || value === null || value === "") return "—"
  if (typeof value === "boolean") return value ? yes : no
  if (typeof value === "object") return "—"
  return String(value)
}

const toApiFilters = (values: ParticipantExportFormData): ExportFilters => ({
  ...(values.status.length > 0 && { status: values.status }),
  ...(values.presence !== "all" && { present: values.presence === "present" }),
  ...(values.registeredFrom && { registeredFrom: values.registeredFrom }),
  ...(values.registeredTo && { registeredTo: values.registeredTo }),
  ...(values.search.trim() && { search: values.search.trim() }),
})

const matchesFilters = (participant: any, values: ParticipantExportFormData) => {
  if (values.status.length > 0 && !values.status.includes(readParticipantValue(participant, "status") as string)) {
    return false
  }

  // Loaded participants may not carry attendance data yet: don't exclude them.
  const isPresent = readParticipantValue(participant, "isPresent")
  if (values.presence !== "all" && typeof isPresent === "boolean" && isPresent !== (values.presence === "present")) {
    return false
  }

  const registeredAt = String(readParticipantValue(participant, "registeredAt") ?? "").slice(0, 10)
  if (values.registeredFrom && registeredAt && registeredAt < values.registeredFrom) return false
  if (values.registeredTo && registeredAt && registeredAt > values.registeredTo) return false

  const search = values.search.trim().toLowerCase()
  if (search) {
    const haystack = ["fullName", "email", "phoneNumber"]
      .map((key) => String(readParticipantValue(participant, key) ?? ""))
      .join(" ")
      .toLowerCase()
    if (!haystack.includes(search)) return false
  }
  return true
}

const SortableColumn = ({
  id,
  label,
  index,
  total,
  onMove,
  moveUpLabel,
  moveDownLabel,
}: {
  id: string
  label: string
  index: number
  total: number
  onMove: (from: number, to: number) => void
  moveUpLabel: string
  moveDownLabel: string
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-sm ${isDragging ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground"
        aria-label={label}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={moveUpLabel}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={moveDownLabel}
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </Button>
    </li>
  )
}

export const ParticipantsExportDialog = ({
  open,
  onOpenChange,
  eventId,
  participants,
}: ParticipantsExportDialogProps) => {
  const { t, i18n } = useTranslation()
  const [availableFields, setAvailableFields] = useState<ExportField[]>([])
  const [statuses, setStatuses] = useState<string[]>(FALLBACK_STATUSES)
  const [isLoadingFields, setIsLoadingFields] = useState(false)
  const [loadError, setLoadError] = useState<"unavailable" | "failed" | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [presets, setPresets] = useState<ExportPreset[] | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("")
  const [presetName, setPresetName] = useState("")
  const [isSavingPreset, setIsSavingPreset] = useState(false)

  const form = useForm<ParticipantExportFormData>({
    resolver: zodResolver(participantExportSchema),
    defaultValues: {
      format: "xlsx",
      csvSeparator: ";",
      fields: [],
      status: [],
      presence: "all",
      registeredFrom: "",
      registeredTo: "",
      search: "",
    },
  })
  const values = form.watch()
  const errors = form.formState.errors

  // The API only offers fr/en/ar labels; Egyptian Arabic uses the Arabic ones.
  const apiLang = (i18n.language.startsWith("en") ? "en" : i18n.language.startsWith("fr") ? "fr" : "ar") as "fr" | "en" | "ar"

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const loadFields = async () => {
    setIsLoadingFields(true)
    setLoadError(null)
    try {
      const response = await fetchParticipantExportFieldsApi(eventId, apiLang)
      const fields = response.fields ?? []
      setAvailableFields(fields)
      if (response.statuses?.length) setStatuses(response.statuses)

      const allowed = new Set(fields.map((field) => field.key))
      const saved = getExportPreferences()
      const savedFields = saved?.fields?.filter((key: string) => allowed.has(key)) ?? []
      form.reset({
        ...form.getValues(),
        ...saved,
        fields: savedFields.length > 0 ? savedFields : fields.filter((field) => field.default).map((field) => field.key),
      })
    } catch (error: any) {
      setLoadError(error?.response?.status === 404 ? "unavailable" : "failed")
    } finally {
      setIsLoadingFields(false)
    }
  }

  // Presets are optional on the backend: without them, the section just stays hidden.
  const loadPresets = async () => {
    try {
      setPresets(await fetchExportPresetsApi())
    } catch {
      setPresets(null)
    }
  }

  useEffect(() => {
    if (!open) return
    loadFields()
    loadPresets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId, apiLang])

  const fieldsByGroup = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        fields: availableFields.filter((field) => field.group === group),
      })).filter(({ fields }) => fields.length > 0),
    [availableFields],
  )

  const labelOf = (key: string) => availableFields.find((field) => field.key === key)?.label ?? key

  const setFields = (fields: string[]) =>
    form.setValue("fields", fields, { shouldValidate: form.formState.isSubmitted })

  const toggleField = (key: string, checked: boolean) =>
    setFields(checked ? [...values.fields, key] : values.fields.filter((field) => field !== key))

  const setGroupSelected = (groupFields: ExportField[], selected: boolean) => {
    const keys = groupFields.map((field) => field.key)
    setFields(
      selected
        ? [...values.fields, ...keys.filter((key) => !values.fields.includes(key))]
        : values.fields.filter((key) => !keys.includes(key)),
    )
  }

  const moveField = (from: number, to: number) => setFields(arrayMove(values.fields, from, to))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    moveField(values.fields.indexOf(String(active.id)), values.fields.indexOf(String(over.id)))
  }

  const toggleStatus = (status: string, checked: boolean) =>
    form.setValue(
      "status",
      checked ? [...values.status, status] : values.status.filter((item) => item !== status),
    )

  const matching = useMemo(
    () => participants.filter((participant) => matchesFilters(participant, values)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participants, values.status, values.presence, values.registeredFrom, values.registeredTo, values.search],
  )

  const handleExport = async (data: ParticipantExportFormData) => {
    setIsExporting(true)
    try {
      const params: ParticipantExportParams = {
        format: data.format,
        fields: data.fields,
        filters: toApiFilters(data),
        lang: apiLang,
        options: {
          includeHeader: true,
          ...(data.format === "csv" && { csvSeparator: data.csvSeparator }),
        },
      }
      const response = await exportEventParticipantsApi(eventId, params)
      downloadBlob(response, `participants.${data.format}`)
      setExportPreferences(data)
      toast.success(t("events.participants.export.success"))
      onOpenChange(false)
    } catch (error: any) {
      const message = await readBlobErrorMessage(error)
      toast.error(message || t("events.participants.export.failed"))
    } finally {
      setIsExporting(false)
    }
  }

  const applyPreset = (id: string) => {
    setSelectedPresetId(id)
    const preset = presets?.find((item) => item._id === id)
    if (!preset) return
    const allowed = new Set(availableFields.map((field) => field.key))
    form.reset({
      ...form.getValues(),
      format: preset.format,
      fields: preset.fields.filter((key) => allowed.has(key)),
      status: preset.filters?.status ?? [],
      presence: preset.filters?.present === undefined ? "all" : preset.filters.present ? "present" : "absent",
      registeredFrom: preset.filters?.registeredFrom ?? "",
      registeredTo: preset.filters?.registeredTo ?? "",
      search: preset.filters?.search ?? "",
    })
  }

  const handleSavePreset = async () => {
    if (!presetName.trim() || values.fields.length === 0) return
    setIsSavingPreset(true)
    try {
      const created = await createExportPresetApi({
        name: presetName.trim(),
        fields: values.fields,
        filters: toApiFilters(values),
        format: values.format,
      })
      setPresets((current) => [...(current ?? []), created])
      setSelectedPresetId(created._id)
      setPresetName("")
      toast.success(t("events.participants.export.presetSaved"))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("events.participants.export.presetFailed"))
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleDeletePreset = async () => {
    if (!selectedPresetId) return
    try {
      await deleteExportPresetApi(selectedPresetId)
      setPresets((current) => current?.filter((preset) => preset._id !== selectedPresetId) ?? null)
      setSelectedPresetId("")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("events.participants.export.presetFailed"))
    }
  }

  const yes = t("common.yes", "Oui")
  const no = t("common.no", "Non")
  const previewFields = values.fields

  const previewCell = (participant: any, key: string) => {
    const value = readParticipantValue(participant, key)
    if (key === "status" && typeof value === "string") {
      return t(`members.status.${value.toLowerCase()}`, value)
    }
    return formatPreviewValue(value, yes, no)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("events.participants.export.title")}</DialogTitle>
          <DialogDescription>{t("events.participants.export.description")}</DialogDescription>
        </DialogHeader>

        {isLoadingFields && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoadingFields && loadError && (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t(`events.participants.export.${loadError === "unavailable" ? "unavailable" : "loadFailed"}`)}
            </p>
            {loadError === "failed" && (
              <Button type="button" variant="outline" onClick={loadFields}>
                {t("common.retry", "Retry")}
              </Button>
            )}
          </div>
        )}

        {!isLoadingFields && !loadError && (
          <div className="space-y-6 py-2">
            {presets !== null && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">{t("events.participants.export.presets")}</h3>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedPresetId} onValueChange={applyPreset}>
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue placeholder={t("events.participants.export.selectPreset")} />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset._id} value={preset._id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPresetId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t("events.participants.export.deletePreset")}
                      onClick={handleDeletePreset}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    className="w-full sm:w-48"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder={t("events.participants.export.presetName")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSavingPreset || !presetName.trim() || values.fields.length === 0}
                    onClick={handleSavePreset}
                  >
                    {t("events.participants.export.savePreset")}
                  </Button>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("events.participants.export.columns")}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPresetId("")
                    setFields(availableFields.filter((field) => field.default).map((field) => field.key))
                  }}
                >
                  {t("events.participants.export.resetDefault")}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fieldsByGroup.map(({ group, fields }) => (
                  <fieldset key={group} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <legend className="text-sm font-medium">{t(`events.participants.export.groups.${group}`)}</legend>
                      <div className="flex gap-2 text-xs">
                        <button type="button" className="underline" onClick={() => setGroupSelected(fields, true)}>
                          {t("events.participants.export.selectAll")}
                        </button>
                        <button type="button" className="underline" onClick={() => setGroupSelected(fields, false)}>
                          {t("events.participants.export.deselectAll")}
                        </button>
                      </div>
                    </div>
                    {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <Checkbox
                          id={`export-field-${field.key}`}
                          checked={values.fields.includes(field.key)}
                          onCheckedChange={(checked) => toggleField(field.key, checked === true)}
                        />
                        <Label htmlFor={`export-field-${field.key}`} className="font-normal">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </fieldset>
                ))}
              </div>
              {errors.fields && <p className="text-sm text-destructive">{errors.fields.message}</p>}
            </section>

            {values.fields.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">{t("events.participants.export.order")}</h3>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={values.fields} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-1">
                      {values.fields.map((key, index) => (
                        <SortableColumn
                          key={key}
                          id={key}
                          label={labelOf(key)}
                          index={index}
                          total={values.fields.length}
                          onMove={moveField}
                          moveUpLabel={t("events.participants.export.moveUp")}
                          moveDownLabel={t("events.participants.export.moveDown")}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t("events.participants.export.filters")}</h3>
              <div className="space-y-2">
                <Label>{t("events.participants.export.filterStatus")}</Label>
                <div className="flex flex-wrap gap-4">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`export-status-${status}`}
                        checked={values.status.includes(status)}
                        onCheckedChange={(checked) => toggleStatus(status, checked === true)}
                      />
                      <Label htmlFor={`export-status-${status}`} className="font-normal">
                        {t(`members.status.${status.toLowerCase()}`, status)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("events.participants.export.filterPresence")}</Label>
                  <Select
                    value={values.presence}
                    onValueChange={(value) => form.setValue("presence", value as ParticipantExportFormData["presence"])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("events.participants.export.presenceAll")}</SelectItem>
                      <SelectItem value="present">{t("events.participants.export.presencePresent")}</SelectItem>
                      <SelectItem value="absent">{t("events.participants.export.presenceAbsent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-search">{t("events.participants.export.filterSearch")}</Label>
                  <Input id="export-search" {...form.register("search")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-from">{t("events.participants.export.registeredFrom")}</Label>
                  <Input id="export-from" type="date" {...form.register("registeredFrom")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-to">{t("events.participants.export.registeredTo")}</Label>
                  <Input id="export-to" type="date" {...form.register("registeredTo")} />
                  {errors.registeredTo && <p className="text-sm text-destructive">{errors.registeredTo.message}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t("events.participants.export.format")}</h3>
              <RadioGroup
                value={values.format}
                onValueChange={(value) => form.setValue("format", value as ParticipantExportFormData["format"])}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="export-format-xlsx" value="xlsx" />
                  <Label htmlFor="export-format-xlsx" className="font-normal">Excel (.xlsx)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="export-format-csv" value="csv" />
                  <Label htmlFor="export-format-csv" className="font-normal">CSV</Label>
                </div>
              </RadioGroup>
              {values.format === "csv" && (
                <div className="space-y-2">
                  <Label>{t("events.participants.export.csvSeparator")}</Label>
                  <RadioGroup
                    value={values.csvSeparator}
                    onValueChange={(value) => form.setValue("csvSeparator", value as ";" | ",")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="export-separator-semicolon" value=";" />
                      <Label htmlFor="export-separator-semicolon" className="font-normal">;</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="export-separator-comma" value="," />
                      <Label htmlFor="export-separator-comma" className="font-normal">,</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </section>

            {previewFields.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">{t("events.participants.export.preview")}</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewFields.map((key) => (
                          <TableHead key={key} className="whitespace-nowrap">{labelOf(key)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matching.slice(0, PREVIEW_ROWS).map((participant, index) => (
                        <TableRow key={participant._id ?? index}>
                          {previewFields.map((key) => (
                            <TableCell key={key} className="whitespace-nowrap">
                              {previewCell(participant, key)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}
          </div>
        )}

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {!loadError && !isLoadingFields && t("events.participants.export.matching", { count: matching.length })}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              disabled={isExporting || isLoadingFields || Boolean(loadError)}
              onClick={form.handleSubmit(handleExport)}
            >
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("events.participants.export.exportButton")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

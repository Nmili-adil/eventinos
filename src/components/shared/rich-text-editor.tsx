import type { ChangeEvent } from "react"
import Editor from "react-simple-wysiwyg"
import "@/styles/rich-text-editor.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onBlur?: () => void
  disabled?: boolean
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  onBlur,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    onChange(event.target.value ?? "")
  }

  return (
    <div className="relative whitespace-nowrap overflow-hidden text-ellipsis word-break-all word-wrap-break-word">

    
    <Editor
      value={value}
      onChange={handleChange}
      onBlur={() => onBlur?.()}
      placeholder={placeholder}
      disabled={disabled}
      containerProps={{
        className: `rich-text-editor border rounded-md focus-within:ring-2 focus-within:ring-primary/40 ${className ?? ""}`,
      }}
      style={{ minHeight: 180 }}
    />
    </div>
  )
}

export default RichTextEditor


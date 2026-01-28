import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, onClose, title, message }) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title || t('globalErrors.error')}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-destructive text-center">{message}</div>
        <DialogFooter>
          <Button onClick={onClose} autoFocus>
            {t('globalErrors.ok')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * Modal component built on top of Dialog for better accessibility
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls if the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {string} props.title - Modal title
 * @param {string} [props.description] - Optional modal description
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Optional modal footer content
 * @param {string} [props.className] - Optional additional classes for the content
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = "",
}) => {
  // Force the modal to be controlled
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;

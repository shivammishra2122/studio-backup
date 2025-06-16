"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Patient } from "@/services/api";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function PatientDetailsModal({ isOpen, onClose, patient }: PatientDetailsModalProps) {
  if (!patient) return null;

  // Format date to display in DD/MM/YYYY format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with title and close button */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-gray-900">Patient Details</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Patient Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">PERSONAL INFORMATION</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{patient.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Gender</span>
                  <span className="text-sm font-medium text-gray-900">{patient.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Age</span>
                  <span className="text-sm font-medium text-gray-900">{patient.age || 'N/A'} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(patient.dob)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Patient ID</span>
                  <span className="text-sm font-mono text-gray-900">{patient.id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">CONTACT INFORMATION</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Mobile</span>
                  <span className="text-sm font-medium text-gray-900">{patient.mobile || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Address</span>
                  <span className="text-sm font-medium text-gray-900 text-right">Not available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admission & Medical Team */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">ADMISSION DETAILS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Admission Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(patient.admissionDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ward No</span>
                  <span className="text-sm font-medium text-gray-900">{patient.wardNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bed No</span>
                  <span className="text-sm font-medium text-gray-900">{patient.bedDetails || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Length of Stay</span>
                  <span className="text-sm font-medium text-gray-900">{patient.lengthOfStay || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">MEDICAL TEAM</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Primary Consultant</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{patient.primaryConsultant || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Treating Consultant</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{patient.encounterProvider || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Specialty</span>
                  <span className="text-sm font-medium text-gray-900">{patient.specialty || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

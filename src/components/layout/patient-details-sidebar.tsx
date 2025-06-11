
import React from 'react';
import { Avatar } from '@/components/ui/avatar'; // Assuming you have an Avatar component

interface PatientDetailsProps {
  patientData: {
    name: string;
    gender: string;
    dob: string;
    age: string;
    pid: string;
    aadhaarNo: string;
    localAddress: string;
    mobNo: string;
    localPinNo: string;
    email: string;
    fatherName: string;
    motherName: string;
    passport: string;
    permanentAddress: string;
    permanentMobNo: string;
    relationship: string;
    registrationDateTime: string;
    permanentMRNNo: string;
    localGuardian: string;
    ipdStatus: string;
    admissionDate: string;
    ward: string;
    roomBed: string;
    primaryConsultant1: string;
    primaryConsultant2: string;
    typeOfAdmission: string;
    ipNo: string;
    transfered: string;
    speciality: string;
    chiefComplaint: string;
    finalDiagnosis: string;
    comorbidity: string;
    referredBy: string;
    specialPrecautions: string;
    remarks: string;
    payerCategory: string;
    mlcStatus: string;
    facilityIncharge: string;
    modeOfInjury: string;
    faculty: string;
    ciopdVisitNoDate: string;
    criticality: string;
    attendedBy: string;
    broughtBy: string;
    mlcReportLink: string;
    dateOfDeath: string;
    deathCertificate: string;
    deathCard: string;
    sourceOfNotification: string;
    deathReport: string;
    policeApplication: string;
  };
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientData }) => {
  return (
    <div className="p-4 border-l border-gray-200 overflow-y-auto" style={{ width: '400px' }}>
      {/* Patient Details Header */}
      <div className="flex items-center mb-4">
        <Avatar className="h-16 w-16 mr-4" />
        <div>
          <h2 className="text-xl font-bold">{patientData.name}</h2>
          <p className="text-sm text-gray-600">{patientData.gender}, {patientData.dob}, {patientData.age}</p>
          <p className="text-sm text-gray-600">PID: {patientData.pid}</p>
        </div>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <p><span className="font-medium">Aadhaar No:</span> {patientData.aadhaarNo}</p>
          <p><span className="font-medium">Local Address:</span> {patientData.localAddress}</p>
          <p><span className="font-medium">Mob No:</span> {patientData.mobNo}</p>
          <p><span className="font-medium">Local PIN No:</span> {patientData.localPinNo}</p>
        </div>
        <div>
          <p><span className="font-medium">Email ID:</span> {patientData.email}</p>
          <p><span className="font-medium">Father's Name:</span> {patientData.fatherName}</p>
          <p><span className="font-medium">Mother's Name:</span> {patientData.motherName}</p>
          <p><span className="font-medium">Passport:</span> {patientData.passport}</p>
        </div>
      </div>

      {/* Patient Other Details */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">Patient Other Details</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p><span className="font-medium">Registration Date/Time:</span> {patientData.registrationDateTime}</p>
          <p><span className="font-medium">Permanent Address:</span> {patientData.permanentAddress}</p>
          <p><span className="font-medium">Permanent MRN No:</span> {patientData.permanentMRNNo}</p>
          <p><span className="font-medium">Permanent Mob No:</span> {patientData.permanentMobNo}</p>
          <p><span className="font-medium">Local Guardian:</span> {patientData.localGuardian}</p>
          <p><span className="font-medium">Relationship:</span> {patientData.relationship}</p>
        </div>
      </div>

      {/* IPD Details */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">IPD Details</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p><span className="font-medium">Status:</span> {patientData.ipdStatus}</p>
          <p><span className="font-medium">IP No:</span> {patientData.ipNo}</p>
          <p><span className="font-medium">Admission Date:</span> {patientData.admissionDate}</p>
          <p><span className="font-medium">Transfered:</span> {patientData.transfered}</p>
          <p><span className="font-medium">Ward:</span> {patientData.ward}</p>
          <p><span className="font-medium">Speciality:</span> {patientData.speciality}</p>
          <p><span className="font-medium">Room Bed:</span> {patientData.roomBed}</p>
          <p><span className="font-medium">Chief Complaint:</span> {patientData.chiefComplaint}</p>
          <p><span className="font-medium">Primary Consultant 1:</span> {patientData.primaryConsultant1}</p>
          <p><span className="font-medium">Final Diagnosis:</span> {patientData.finalDiagnosis}</p>
          <p><span className="font-medium">Primary Consultant 2:</span> {patientData.primaryConsultant2}</p>
          <p><span className="font-medium">Comorbidity:</span> {patientData.comorbidity}</p>
          <p><span className="font-medium">Type Of Admission:</span> {patientData.typeOfAdmission}</p>
          <p><span className="font-medium">Referred By:</span> {patientData.referredBy}</p>
          <p><span className="font-medium">Special Precautions:</span> {patientData.specialPrecautions}</p>
        </div>
      </div>

      {/* Remarks */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">Remarks</h3>
        <p className="text-xs">{patientData.remarks}</p>
      </div>

      {/* Insurance Details */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">Insurance Details</h3>
        <p className="text-xs"><span className="font-medium">Payer Category:</span> {patientData.payerCategory}</p>
      </div>

      {/* Electronic Medical Legal Case/MLC Details */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">Electronic Medical Legal Case/MLC Details</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p><span className="font-medium">MLC Status:</span> {patientData.mlcStatus}</p>
          <p><span className="font-medium">Criticality:</span> {patientData.criticality}</p>
          <p><span className="font-medium">Facility Incharge:</span> {patientData.facilityIncharge}</p>
          <p><span className="font-medium">Attended By:</span> {patientData.attendedBy}</p>
          <p><span className="font-medium">Mode Of Injury:</span> {patientData.modeOfInjury}</p>
          <p><span className="font-medium">Brought By:</span> {patientData.broughtBy}</p>
          <p><span className="font-medium">Faculty:</span> {patientData.faculty}</p>
          <p><span className="font-medium">MLC Report Link:</span> {patientData.mlcReportLink}</p>
          <p><span className="font-medium">CIOPD (Visit No., Date):</span> {patientData.ciopdVisitNoDate}</p>
        </div>
      </div>

      {/* Autopsy Details */}
      <div className="border-t border-b border-gray-200 py-2 mb-4">
        <h3 className="font-bold text-sm mb-2">Autopsy Details</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p><span className="font-medium">Date Of Death:</span> {patientData.dateOfDeath}</p>
          <p><span className="font-medium">Source Of Notification:</span> {patientData.sourceOfNotification}</p>
          <p><span className="font-medium">Death Certificate:</span> {patientData.deathCertificate}</p>
          <p><span className="font-medium">Death Report:</span> {patientData.deathReport}</p>
          <p><span className="font-medium">Death Card:</span> {patientData.deathCard}</p>
          <p><span className="font-medium">Police Application:</span> {patientData.policeApplication}</p>
        </div>
      </div>

      {/* You can add a print button here if needed */}
      {/* <button onClick={() => window.print()}>Print</button> */}
    </div>
  );
};

export default PatientDetails;
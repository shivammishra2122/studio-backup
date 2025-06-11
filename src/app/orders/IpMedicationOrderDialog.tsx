import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_AVAILABLE_MEDICATIONS = [
  "PARACETAMOL 500MG",
  "PARACETAMOL ER UD 650MG TAB",
  "ASPIRIN 100MG",
  "AMOXICILLIN 250MG",
  "ASPARAGUS RECEMOSUS UD 250MG CAP,ORAL"
];

const ROUTES = ["ORAL", "IV", "IM", "SC"];
const SCHEDULES = ["SELECT", "BID", "TID", "QID", "STAT"];
const PRIORITIES = ["ROUTINE", "URGENT"];

const initialRow = (medicationName: string) => ({
  medicationName,
  dosage: "",
  route: ROUTES[0],
  schedule: SCHEDULES[0],
  prn: false,
  duration: 0,
  durationUnit: "days",
  priority: PRIORITIES[0],
  additionalDoseNow: false,
  comment: "",
});

interface IpMedicationOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: handleConfirmOrder?: (rows: typeof initialRow[]) => void;
}

const IpMedicationOrderDialog: React.FC<IpMedicationOrderDialogProps> = ({ open, onOpenChange }) => {
  const [medSearch, setMedSearch] = useState("");
  const [filteredMeds, setFilteredMeds] = useState<string[]>(ALL_AVAILABLE_MEDICATIONS);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [quickOrder, setQuickOrder] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!medSearch) setFilteredMeds(ALL_AVAILABLE_MEDICATIONS);
    else setFilteredMeds(
      ALL_AVAILABLE_MEDICATIONS.filter(med => med.toLowerCase().includes(medSearch.toLowerCase()))
    );
  }, [medSearch]);

  const handleSelectMed = (medicationName: string) => {
    if (!selectedRows.some(row => row.medicationName === medicationName)) {
      setSelectedRows(rows => [...rows, initialRow(medicationName)]);
    }
    setMedSearch("");
    setDropdownOpen(false);
  };

  const handleRemoveRow = (idx: number) => {
    setSelectedRows(rows => rows.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx: number, key: string, value: any) => {
    setSelectedRows(rows => rows.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  };

  const handleReset = () => {
    setMedSearch("");
    setSelectedRows([]);
    setQuickOrder("");
    setDropdownOpen(false);
  };

  const handleConfirmOrder = () => {
    // TODO: handle order submission, e.g. call props.handleConfirmOrder(selectedRows);
    onOpenChange(false);
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0">
        <div className="bg-sky-100 p-3">
          <DialogTitle className="text-lg font-semibold text-sky-800">Order Medicines</DialogTitle>
        </div>
        <div className="bg-sky-100 p-3 text-xs text-sky-700 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span>Patient ID : 80000035</span>
          <span>Name : Anonymous Two</span>
          <span>Age : 69 Years</span>
          <span>Sex : MALE</span>
          <span>Patient Type : In Patient</span>
        </div>

        <div className="p-4 flex gap-4 items-end">
          <div className="flex-1 relative">
            <label className="block text-sm font-medium">Medication Name</label>
            <Input
              value={medSearch}
              onChange={e => {
                setMedSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 120)}
              className="w-full"
              placeholder="Type to search..."
              autoComplete="off"
            />
            {dropdownOpen && medSearch && (
              <div className="border rounded bg-white max-h-48 overflow-y-auto absolute z-20 w-full">
                {filteredMeds.length === 0 ? (
                  <div className="p-2 text-muted-foreground">No medication found.</div>
                ) : (
                  filteredMeds.map(med => (
                    <div
                      key={`medication-${med}`}
                      className="p-2 hover:bg-sky-100 cursor-pointer"
                      onMouseDown={() => handleSelectMed(med)}
                    >
                      {med}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Quick Order</label>
            <Input
              value={quickOrder}
              onChange={e => setQuickOrder(e.target.value)}
              className="w-full"
              placeholder=""
            />
          </div>
          <Button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 text-xs">Edit Quick List</Button>
        </div>

        {selectedRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full mt-2 border">
              <thead className="bg-blue-200">
                <tr>
                  <th className="px-2 py-1">Medicine Name</th>
                  <th className="px-2 py-1">Dosage</th>
                  <th className="px-2 py-1">Route</th>
                  <th className="px-2 py-1">Schedule</th>
                  <th className="px-2 py-1">PRN</th>
                  <th className="px-2 py-1">Duration</th>
                  <th className="px-2 py-1">Priority</th>
                  <th className="px-2 py-1">Additional Dose Now</th>
                  <th className="px-2 py-1">Comment</th>
                  <th className="px-2 py-1">Remove</th>
                  <th className="px-2 py-1">Save Quick Order</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row, idx) => (
                  <tr key={`medication-${row.medicationName}-${idx}`}>
                    <td className="px-2 py-1">{row.medicationName}</td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.dosage}
                        onChange={e => handleRowChange(idx, "dosage", e.target.value)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Select value={row.route} onValueChange={val => handleRowChange(idx, "route", val)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTES.map(route => (
                            <SelectItem key={`route-${route}`} value={route}>{route}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1">
                      <Select value={row.schedule} onValueChange={val => handleRowChange(idx, "schedule", val)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHEDULES.map(schedule => (
                            <SelectItem key={`schedule-${schedule}`} value={schedule}>{schedule}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Checkbox checked={row.prn} onCheckedChange={val => handleRowChange(idx, "prn", val)} />
                    </td>
                    <td className="px-2 py-1 flex items-center">
                      <Input
                        type="number"
                        value={row.duration}
                        onChange={e => handleRowChange(idx, "duration", e.target.value)}
                        className="w-12"
                      />
                      <Select value={row.durationUnit} onValueChange={val => handleRowChange(idx, "durationUnit", val)}>
                        <SelectTrigger className="w-16 h-8 ml-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">days</SelectItem>
                          <SelectItem value="weeks">weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1">
                      <Select value={row.priority} onValueChange={val => handleRowChange(idx, "priority", val)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map(priority => (
                            <SelectItem value={priority} key={priority}>{priority}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Checkbox checked={row.additionalDoseNow} onCheckedChange={val => handleRowChange(idx, "additionalDoseNow", val)} />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.comment}
                        onChange={e => handleRowChange(idx, "comment", e.target.value)}
                        className="w-28"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(idx)}>❌</Button>
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Button variant="ghost" size="icon">💾</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center space-x-4 p-4 pt-2 border-t border-gray-200">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 text-xs px-6" onClick={handleConfirmOrder}>Confirm Order</Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 text-xs px-6" onClick={handleReset}>Reset</Button>
          <DialogClose asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 text-xs px-6">Close</Button>
          </DialogClose>
        </div>
        <div className="bg-sky-100 p-2 text-center">
          <p className="text-xs text-sky-700">Copyright © 2015 Sansys Informatics Pvt. Ltd</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IpMedicationOrderDialog;
import { useState, useEffect, use } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import toast from "react-hot-toast";
import { on } from "events";

export default function StudentBulkActionModal({ open, onClose, students, onAction }) {
    const [program, setProgram] = useState("");
    const [semester, setSemester] = useState("");
    const [newSemester, setNewSemester] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allSemester, setAllSemester] = useState<any[][]>([[], [], [], []]);
     const fetchSemesters = async (i) => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student/getSem/${i+1}`);
                    setAllSemester((prev)=>{
                        const newSemester = [...prev];
                        newSemester[i] = response.data.data;
                        return newSemester;
                    });
                } catch (error) {
                    toast.error("Failed to fetch semesters");
                }
            };

    useEffect(() => {
        // Fetch all semesters from the server
        for (let i = 0; i < 4; i++) {
           
            fetchSemesters(i);

        }

    }, []);
    
    

    // Filtered students based on selected program and semester
    const filtered = students.filter(
        (s) =>
            (!program || s.programmEnroled == program) &&
            (!semester || s.currentSemester == semester)
    );

    // Determine if all filtered students are selected
    const allFilteredIds = filtered.map((s) => s.id);
    const selectAll = filtered.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

    // Toggle individual selection
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectAll) {
            // Deselect all filtered
            setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
        } else {
            // Select all filtered
            setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
        }
    };

    const handleDelete = () => {
        onAction("delete", selectedIds,()=>{fetchSemesters(parseInt(program)-1)
            
        });
        onClose();
        setProgram("");
        setSemester("");
        setNewSemester("");
        setSelectedIds([]);
    };

    const handleEdit = () => {
        onAction("edit", selectedIds, newSemester,()=>{fetchSemesters(parseInt(program)-1)
        });
        onClose();
        setProgram("");
        setSemester("");
        setNewSemester("");
        setSelectedIds([]);

    };

    return (
        <Dialog open={open} onOpenChange={() => {
            setSelectedIds([]);
            setProgram("");
            setSemester("");
            setNewSemester("");
            onClose();
        }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Filter and Update Students
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="text-sm">Program</label>
                        <Select onValueChange={setProgram}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">B.Tech</SelectItem>
                                <SelectItem value="2">M.Tech (CSE)</SelectItem>
                                <SelectItem value="3">Dual Degree</SelectItem>
                                <SelectItem value="4">M.Tech (AI)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-1/2">
                        <label className="text-sm">Current Semester</label>
                        <Select onValueChange={setSemester}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {program&&allSemester[parseInt(program) - 1].map((sem) => (
                                    <SelectItem key={sem} value={sem}>
                                        {`Semester ${sem}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4 max-h-60 overflow-y-auto border rounded">
                    <div className="p-2 bg-gray-100">
                        <span className="text-sm font-semibold">{`${selectedIds.length} students Selected`}</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-2">
                                    <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                                </th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Roll No</th>
                                <th className="p-2">Curr. Sem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((student) => (
                                <tr key={student.id} className="border-t">
                                    <td className="p-2">
                                        <Checkbox
                                            checked={selectedIds.includes(student.id)}
                                            onCheckedChange={() => toggleSelection(student.id)}
                                        />
                                    </td>
                                    <td className="p-2">{student.name}</td>
                                    <td className="p-2">{student.rollNo}</td>
                                    <td className="p-2">{student.currentSemester}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-4 items-center mt-4">
                    <div className="flex-1">
                        <label className="text-sm">New Semester (for Edit)</label>
                        <Select onValueChange={setNewSemester}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose New Semester" />
                            </SelectTrigger>
                            <SelectContent>

                                {program&&program==='1'?<>
                                <SelectItem value="1">Semester 1</SelectItem>
                                <SelectItem value="2">Semester 2</SelectItem>
                                <SelectItem value="3">Semester 3</SelectItem>
                                <SelectItem value="4">Semester 4</SelectItem>
                                <SelectItem value="5">Semester 5</SelectItem>
                                <SelectItem value="6">Semester 6</SelectItem>
                                <SelectItem value="7">Semester 7</SelectItem>
                                <SelectItem value="8">Semester 8</SelectItem>
                                </>
                                
                                :program==='2'?<>
                                <SelectItem value="1">Semester 1</SelectItem>
                                <SelectItem value="2">Semester 2</SelectItem>
                                <SelectItem value="3">Semester 3</SelectItem>
                                <SelectItem value="4">Semester 4</SelectItem>
                                </>
                                :program==='3'?<>
                                <SelectItem value="1">Semester 1</SelectItem>
                                <SelectItem value="2">Semester 2</SelectItem>
                                <SelectItem value="3">Semester 3</SelectItem>
                                <SelectItem value="4">Semester 4</SelectItem>
                                <SelectItem value="5">Semester 5</SelectItem>
                                <SelectItem value="6">Semester 6</SelectItem>
                                <SelectItem value="7">Semester 7</SelectItem>
                                <SelectItem value="8">Semester 8</SelectItem>
                                <SelectItem value="9">Semester 9</SelectItem>
                                <SelectItem value="10">Semester 10</SelectItem>
                                </>
                                :program==='4'?<>
                                <SelectItem value="1">Semester 1</SelectItem>
                                <SelectItem value="2">Semester 2</SelectItem>
                                <SelectItem value="3">Semester 3</SelectItem>
                                <SelectItem value="4">Semester 4</SelectItem>
                                
                                </>:null}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedIds.length > 0 && <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDelete}
                    >
                        Delete Selected
                    </Button>}
                    {selectedIds.length > 0 && newSemester && <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleEdit}
                    >
                        Edit Semester
                    </Button>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

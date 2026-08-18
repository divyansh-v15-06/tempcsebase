"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { IFacultyInfo } from "@/components/Faculty/facultyinfocomp"
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyInfo : IFacultyInfo
  fetchData: () => Promise<void>;
}

function InputField ({ defaultValue, id, name, placeholder, label, type }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs sm:text-sm text-neutral-700 font-normal">
        {label}
      </label>
      <Input 
        id={id}
        type={type}
        className="w-full bg-neutral-50 border-neutral-200 text-sm text-neutral-800"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  )
}


export default function AdminModalPersonalInfoUpdate({ isOpen, onClose, facultyInfo, fetchData }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (modalRef.current && !modalRef.current.contains(target)) {
      onClose();
    }

    }, [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, handleClickOutside]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true)
    const formData = new FormData(event.currentTarget);
    const formObj: IFacultyInfo = {
      dateOfBirth: formData.get("dob") as string,
      dateOfJoining: formData.get("doj") as string,
      phoneNo: formData.get("phoneNo") as string,
      educationalQualification: formData.get("qualification") as string,
      teachingExperience: formData.get("teachingExperience") as string,
      administrativeExperience: formData.get("administrativeExperience") as string,
      googleScholar: formData.get("googleScholar") as string,
      // excluding linkedin and rg link for now not present in backend 
      linkedIn: formData.get("linkedIn") as string,
      rgLink: formData.get("rgLink") as string,
      publons: formData.get("publons") as string,
      orcid: formData.get("orcid") as string,
      vidwan: formData.get("vidwan") as string,
      researchGate: formData.get("researchGate") as string,
      scopus: formData.get("scopus") as string
    }
    const userId = sessionStorage.getItem("userId");
    const accessToken = sessionStorage.getItem("access_token");
    // console.log(formObj)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facultyInfo/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `Bearer ${accessToken as string}`
        },
        body: JSON.stringify(formObj)
      })
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        setIsLoading(false);
        toast.success("Personal Info Updated Successfully");
        onClose();
      } else {
        toast.error("Error while Updating Personal Info");
      }
    } catch (err) {
      toast.error("Error while Updating Personal Info");
      console.log("Error while updating personal info", err);
      setIsLoading(false)
    } finally {
      setIsLoading(false);
      fetchData();
    }
  }

  if (!isOpen) return null;
  return(
    <div className="fixed inset-0 h-[100vh] m-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-10">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg animate-in fade-in duration-200"
        ref={modalRef}
      >
        <form className="space-y-3 max-h-[85vh] overflow-y-auto scrollbar-thin" onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white px-5 py-2 rounded-t-lg">
            <div className="flex justify-between mt-2 text-2xl">
              Update Personal Info
              <span onClick={onClose} className="cursor-pointer">&times;</span>
            </div>
          </div>
          <div className="space-y-3 px-8">
            <InputField 
              type="date"
              label="Date of Birth"
              id="dob"
              defaultValue={facultyInfo.dateOfBirth}
              placeholder="1975-05-10"
              name="dob"
            />
            <InputField 
              type="date"
              label="Date of Joining"
              id="doj"
              defaultValue={facultyInfo.dateOfJoining}
              placeholder="2005-08-15"
              name="doj"
            />
            <InputField 
            type={"number"}
              label="Phone"
              id="phoneNo"
              defaultValue={facultyInfo.phoneNo}
              placeholder="+91-9876543210"
              name="phoneNo"
            />
            <InputField 
            type="text"
              label="Google Scholar"
              id="googleScholar"
              defaultValue={facultyInfo.googleScholar}
              placeholder="Google Scholar link"
              name="googleScholar"
            />
            <InputField 
            type="text"
              label="LinkedIn"
              id="linkedIn"
              defaultValue={facultyInfo.linkedIn}
              placeholder="LinkedIn Profile Url"
              name="linkedIn"
            />
            <InputField 
            type={"text"}
              label="RG Link"
              id="rgLink"
              defaultValue={facultyInfo.rgLink}
              placeholder="RG Link"
              name="rgLink"
            />
            <InputField 
            type="text"
              label="Publons"
              id="publons"
              defaultValue={facultyInfo.publons}
              placeholder="Publons"
              name="publons"
            />
            <InputField 
            type="text"
              label="ORC Id"
              id="orcid"
              defaultValue={facultyInfo.orcid}
              placeholder="ORC Id"
              name="orcid"
            />
            <InputField 
            type="text"
              label="Vidwan"
              id="vidwan"
              defaultValue={facultyInfo.vidwan}
              placeholder="Vidwan"
              name="vidwan"
            />
            <InputField 
            type="text"
              label="Research Gate"
              id="researchGate"
              defaultValue={facultyInfo.researchGate}
              placeholder="Research Gate"
              name="researchGate"
            />
            <InputField 
            type="text"
              label="Scopus"
              id="scopus"
              defaultValue={facultyInfo.scopus}
              placeholder="Scopus"
              name="scopus"
            />
            <div className="flex justify-end py-4">
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-600 text-white" disabled={isLoading} type="submit">
                  Update
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
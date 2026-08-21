import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//     cloud_name: "",
//     api_key: "",
//     api_secret: "",
// });

// export const uploadToCloudinary=async(file)=>{

//   try {
//       const result = await cloudinary.uploader.upload(file,{
//           resource_type:"auto",
//       })
//       return result.secure_url
//   } catch (error) {
//     console.log(error)
//       console.log("Error uploading to cloudinary: ",error)
//       throw new Error("Error uploading to cloudinary: ")
//   }
// }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem('access_token'); 
    return !!token; 
  }
  return false;
};

export const isAuthenticatedADmin = () => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('access_token'); 
    return !!token; 
  }
  return false;
};


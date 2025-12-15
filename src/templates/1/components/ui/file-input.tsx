import { uploadsUrl } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/api/files";
import { formatFileSize } from "@/lib/utils";
import { FileInput as FileInputProps } from "@/types";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

function FileInput({ fileName, setFileName }: FileInputProps) {
  const { site } = useParams();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);

  const handleChange = async (file: File) => {
    setFile(file);

    var formData = new FormData();
    formData.append("files", file);

    const result = await uploadFile({
      userId: site as string,
      customerId: user?.customerId.toString() as string,
      formData: formData,
    });

    setFileName(result.files[0].filename);
  };

  return (
    <div>
      <FileUploader handleChange={handleChange} name="file" types={fileTypes}>
        <div className="border border-dashed p-4 rounded-lg bg-white flex items-center gap-5 cursor-pointer">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500">
            <ImageIcon />
          </div>

          <div className="text-gray-500 grid gap-0.5">
            <p className="font-medium text-[15px]">
              {file ? (
                file.name
              ) : (
                <>
                  Drag and Drop a file or{" "}
                  <span className="text-primary underline">Browse</span>
                </>
              )}
            </p>
            <p className="text-sm">
              {file
                ? formatFileSize(file.size)
                : fileTypes.slice(0, -1).join(", ") +
                  " and " +
                  fileTypes[fileTypes.length - 1]}
            </p>
          </div>
        </div>
      </FileUploader>

      {fileName && (
        <Image
          src={uploadsUrl + "/" + fileName}
          alt=""
          width={112}
          height={112}
          className="w-28 h-28 rounded-lg object-cover mt-2"
        />
      )}
    </div>
  );
}

export default FileInput;

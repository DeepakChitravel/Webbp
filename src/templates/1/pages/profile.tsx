"use client";
import { Label } from "@/components/ui/label";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import PhoneInput from "../components/ui/phone-input";
import { useAuth } from "@/contexts/AuthContext";
import FileInput from "../components/ui/file-input";
import { Button } from "../components/ui/button";
import { updateCustomer } from "@/lib/api/customers";
import { handleToast } from "@/lib/utils";

const Profile = () => {
  const { user, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setPhoto(user.photo);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const result = await updateCustomer({
        id: user?.id as number,
        data: {
          name,
          email,
          phone,
          photo,
        },
      });

      handleToast(result);
      if (result.success) login(result.customer);
    } catch (error) {}
  };

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg p-5 grid gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(value: string) => setPhone(value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label htmlFor="photo">Photo</Label>
          <FileInput fileName={photo} setFileName={setPhoto} />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default Profile;

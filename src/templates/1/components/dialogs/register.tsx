"use client";
import { setCookie } from "cookies-next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "../ui/phone-input";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { registerCustomer, sendOtp } from "@/lib/api/customers";
import { useParams } from "next/navigation";
import { userWithSite } from "@/lib/api/users";
import { handleToast } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const RegisterDialog = ({ children, className }: Props) => {
  const { login } = useAuth();
  const { site } = useParams();

  const [id, setId] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<number | null>(null);

  const [sentOtp, setSentOtp] = useState<number | null>(null);

  useEffect(() => {
    async function getUserData() {
      const user = await userWithSite(site as string, {
        id: true,
      });
      setId(user.id);
    }
    getUserData();
  }, []);

  const handlePrevCloseBtn = () => {
    if (step <= 1) {
      setIsOpen(false);
      setStep(1);
    } else {
      setStep((current) => current - 1);
    }
  };

  const handleBtnOnClick = () => {
    if (step === 1) {
      if (!name) return toast.error("You must provide a name");
      if (!phone) return toast.error("You must provide a phone number");
      if (!isPossiblePhoneNumber(phone))
        return toast.error("You must provide a valid phone number");

      handleSendOtp();
    }

    if (step === 2) {
      if (otp !== sentOtp) {
        return toast.error("You entered an incorrect otp code");
      }
      setStep(3);
    }

    if (step === 3) {
      if (!password) return toast.error("You must provide a password");

      handleRegister();
    }
  };

  const handleSendOtp = async () => {
    try {
      const result = await sendOtp({ userId: id, phone, unique: true });

      handleToast(result);

      if (result.success) {
        setSentOtp(result.otp);
        setStep(2);
      } else {
        return;
      }
    } catch (error) {}
  };

  const handleRegister = async () => {
    try {
      const result = await registerCustomer({
        userId: id,
        name,
        email,
        phone,
        password,
      });

      handleToast(result);
      login(result.customer);
      setCookie("token", result.token, { path: "/" + site });

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setOtp(null);
      setSentOtp(-1);
      setStep(0);

      return setIsOpen(false);
    } catch (error) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen((current) => !current)}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create an account to save your appointment history.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {(step === 1 || step === 3) && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  className="col-span-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone">Phone *</Label>
                <div className="col-span-3">
                  <PhoneInput
                    id="phone"
                    placeholder="+91XXXXXXXXXX"
                    value={phone}
                    onChange={(value: string) => setPhone(value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Email Address (optional)"
                  className="col-span-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password">Password *</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="********"
                  className="col-span-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">OTP Code</Label>
              <div className="col-span-3">
                <InputOTP
                  maxLength={6}
                  value={otp?.toString()}
                  onChange={(value) => setOtp(parseInt(value))}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handlePrevCloseBtn} variant="ghost">
            {step <= 1 ? "Close" : "Previous"}
          </Button>

          <Button onClick={handleBtnOnClick}>
            {step === 1 ? "Send OTP" : step === 2 ? "Continue" : "Sign Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // or your icon set

export default function PasswordField({
  label,
  id = "password",
  name = "password",
  value,
  onChange,
}: {
  label: string;
  id?: string;
  name?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={() => setShow(true)}
          onMouseUp={() => setShow(false)}
          onMouseLeave={() => setShow(false)}
          className="absolute inset-y-0 right-0"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

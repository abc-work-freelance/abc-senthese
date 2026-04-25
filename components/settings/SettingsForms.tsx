"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfileName, updateProfilePassword } from "@/app/actions/settings"

type SettingsFormsProps = {
  initialName: string
  email: string
}

function Feedback({ message, success }: { message: string; success: boolean }) {
  return (
    <p
      className="text-sm"
      style={{ color: success ? "#10B981" : "#EF4444" }}
      role="status"
    >
      {message}
    </p>
  )
}

export function SettingsForms({ initialName, email }: SettingsFormsProps) {
  const [name, setName] = useState(initialName)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [nameFeedback, setNameFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const [isSavingName, startSavingName] = useTransition()
  const [isSavingPassword, startSavingPassword] = useTransition()

  const onSubmitName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNameFeedback(null)

    startSavingName(async () => {
      const result = await updateProfileName(name)
      setNameFeedback(result)
    })
  }

  const onSubmitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordFeedback(null)

    startSavingPassword(async () => {
      const result = await updateProfilePassword(currentPassword, newPassword, confirmPassword)
      setPasswordFeedback(result)

      if (result.success) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#E8ECF0] bg-white p-6 shadow-none" style={{ borderRadius: "14px" }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#1A2332]">Profile</h2>
          <p className="text-sm text-[#94A3B8]">Update your display name and account details.</p>
        </div>

        <form onSubmit={onSubmitName} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]" htmlFor="settings-name">
              Name
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-[#E8ECF0] bg-white"
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]" htmlFor="settings-email">
              Email
            </label>
            <Input
              id="settings-email"
              value={email}
              readOnly
              className="border-[#E8ECF0] bg-[#F8FAFC] text-[#64748B]"
              style={{ borderRadius: "10px" }}
            />
          </div>

          {nameFeedback && <Feedback message={nameFeedback.message} success={nameFeedback.success} />}

          <Button
            type="submit"
            disabled={isSavingName}
            style={{
              backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              boxShadow: "0 4px 14px rgba(0,196,154,0.3)",
              borderRadius: "10px",
              color: "#FFFFFF",
            }}
            className="hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,196,154,0.28)]"
          >
            {isSavingName ? "Saving..." : "Save name"}
          </Button>
        </form>
      </Card>

      <Card className="border-[#E8ECF0] bg-white p-6 shadow-none" style={{ borderRadius: "14px" }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#1A2332]">Security</h2>
          <p className="text-sm text-[#94A3B8]">Change your account password.</p>
        </div>

        <form onSubmit={onSubmitPassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]" htmlFor="current-password">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="border-[#E8ECF0] bg-white"
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]" htmlFor="new-password">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="border-[#E8ECF0] bg-white"
                style={{ borderRadius: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#374151]" htmlFor="confirm-password">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="border-[#E8ECF0] bg-white"
                style={{ borderRadius: "10px" }}
              />
            </div>
          </div>

          {passwordFeedback && <Feedback message={passwordFeedback.message} success={passwordFeedback.success} />}

          <Button
            type="submit"
            disabled={isSavingPassword}
            style={{
              backgroundImage: "linear-gradient(135deg, #00C49A 0%, #0EA5E9 100%)",
              boxShadow: "0 4px 14px rgba(0,196,154,0.3)",
              borderRadius: "10px",
              color: "#FFFFFF",
            }}
            className="hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,196,154,0.28)]"
          >
            {isSavingPassword ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

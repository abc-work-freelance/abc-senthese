"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfileName, updateProfilePhone, updateProfilePassword } from "@/app/actions/settings"

type SettingsFormsProps = {
  initialName: string
  email: string
  initialPhone: string
}

function Feedback({ message, success }: { message: string; success: boolean }) {
  return (
    <p
      className="text-sm"
      style={{ color: success ? "var(--ok)" : "var(--danger)" }}
      role="status"
    >
      {message}
    </p>
  )
}

export function SettingsForms({ initialName, email, initialPhone }: SettingsFormsProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [nameFeedback, setNameFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [phoneFeedback, setPhoneFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const [isSavingName, startSavingName] = useTransition()
  const [isSavingPhone, startSavingPhone] = useTransition()
  const [isSavingPassword, startSavingPassword] = useTransition()

  const onSubmitName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNameFeedback(null)

    startSavingName(async () => {
      const result = await updateProfileName(name)
      setNameFeedback(result)
    })
  }

  const onSubmitPhone = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPhoneFeedback(null)

    startSavingPhone(async () => {
      const result = await updateProfilePhone(phone)
      setPhoneFeedback(result)
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
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Update your display name and account details.</p>
        </div>

        <form onSubmit={onSubmitName} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="settings-name">
              Name
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="settings-email">
              Email
            </label>
            <Input
              id="settings-email"
              value={email}
              readOnly
              className="bg-muted text-muted-foreground"
              style={{ borderRadius: "10px" }}
            />
          </div>

          {nameFeedback && <Feedback message={nameFeedback.message} success={nameFeedback.success} />}

          <Button
            type="submit"
            disabled={isSavingName}
          >
            {isSavingName ? "Saving..." : "Save name"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">WhatsApp number</h2>
          <p className="text-sm text-muted-foreground">
            Used for assignment alerts and to receive password-reset codes. International format, e.g. +212600000000.
          </p>
        </div>

        <form onSubmit={onSubmitPhone} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="settings-phone">
              Phone number
            </label>
            <Input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+212600000000"
              style={{ borderRadius: "10px" }}
            />
          </div>

          {phoneFeedback && <Feedback message={phoneFeedback.message} success={phoneFeedback.success} />}

          <Button
            type="submit"
            disabled={isSavingPhone}
          >
            {isSavingPhone ? "Saving..." : "Save number"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">Security</h2>
          <p className="text-sm text-muted-foreground">Change your account password.</p>
        </div>

        <form onSubmit={onSubmitPassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="current-password">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="new-password">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground" htmlFor="confirm-password">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </div>
          </div>

          {passwordFeedback && <Feedback message={passwordFeedback.message} success={passwordFeedback.success} />}

          <Button
            type="submit"
            disabled={isSavingPassword}
          >
            {isSavingPassword ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

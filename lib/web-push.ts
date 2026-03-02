import webPush from "web-push"

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com"

if (!publicVapidKey || !privateVapidKey) {
  console.warn(
    "[web-push] VAPID keys are not set. Push notifications will be disabled.",
  )
} else {
  webPush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey)
}

export { webPush, publicVapidKey }


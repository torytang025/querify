import { useState } from "react"

import "@/styles/globals.css"

import { QueryForm } from "./components/query-form"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="p-4 w-[496]">
      <QueryForm />
    </div>
  )
}

export default IndexPopup

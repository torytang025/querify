import { Button } from "@/components/ui/button"
import { useState } from "react"

import "@/styles/globals.css"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="p-4 w-96">
      <h1>
        Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
      </h1>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <footer>Crafted by @PlasmoHQ</footer>
      <Button size="sm">1123</Button>
    </div>
  )
}

export default IndexPopup

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, ZoomIn, ZoomOut } from "lucide-react"

export default function VoiceCommandsApp() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [fontSize, setFontSize] = useState(16)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  // Process the voice command
  const processCommand = (command: string) => {
    if (command.includes("increase font")) {
      setFontSize((prev) => prev + 10)
      setLastCommand("increase font")
    } else if (command.includes("decrease font")) {
      setFontSize((prev) => Math.max(10, prev - 10))
      setLastCommand("decrease font")
    }
  }

  // Toggle recording on/off
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Start the speech recognition
  const startRecording = () => {
    setErrorMessage(null)

    // Check browser support
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setErrorMessage("Your browser doesn't support speech recognition. Try Chrome or Edge.")
      return
    }

    try {
      // Create a new instance each time
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false // Changed to false to avoid some browser issues
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript("")
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            processCommand(transcript.toLowerCase().trim())
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setErrorMessage(`Recognition error: ${event.error}`)

        // Don't automatically stop for all errors
        if (event.error === "network" || event.error === "service-not-allowed") {
          stopRecording()
        }
      }

      recognition.onend = () => {
        // Simply mark as not recording when it ends
        setIsRecording(false)
      }

      // Store the recognition instance
      recognitionRef.current = recognition

      // Start recognition
      recognition.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setErrorMessage("Failed to start speech recognition")
      setIsRecording(false)
    }
  }

  // Stop the speech recognition
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error("Error stopping recognition on unmount:", error)
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto bg-background">
      <Card className="mb-8 border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Voice Commands App</CardTitle>
          <CardDescription>Control the app using your voice</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-6 py-6 text-lg transition-all duration-300 ${
              isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"
            }`}
            size="lg"
          >
            {isRecording ? (
              <>
                <MicOff className="h-5 w-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Recording
              </>
            )}
          </Button>

          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md w-full text-center">{errorMessage}</div>
          )}

          <div className="mt-6 p-4 border rounded-md w-full bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <p className="font-medium">Recognized Speech:</p>
              {isRecording && (
                <Badge variant="outline" className="ml-auto animate-pulse bg-red-100 text-red-800 border-red-200">
                  Listening...
                </Badge>
              )}
            </div>
            <p className="italic min-h-[50px] p-2 bg-background rounded border">{transcript || "Say something..."}</p>

            {lastCommand && (
              <div className="mt-2 text-sm text-muted-foreground">
                Last command executed: <span className="font-semibold text-primary">{lastCommand}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Sample Text</CardTitle>
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{fontSize}px</span>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ fontSize: `${fontSize}px` }} className="transition-all duration-300">
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
              erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
            </p>
            <p>
              Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum
              feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Available Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                "Increase font"
              </Badge>
              <span>Increases text size by 10px</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                "Decrease font"
              </Badge>
              <span>Decreases text size by 10px</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


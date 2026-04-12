"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ShadcnTestPage() {
  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Shadcn UI Installation Test</h1>
          <p className="text-lg text-slate-600">Verifying that components are correctly installed and styled.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Gallery</CardTitle>
              <CardDescription>Testing different button variants.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input & Interaction</CardTitle>
              <CardDescription>Testing form elements and dialogs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Type something..." />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Success!</DialogTitle>
                    <DialogDescription>
                      Shadcn UI is correctly configured in the Haspataal project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-slate-500">
                      You can now use these components across the entire platform.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Medical Theme Check</CardTitle>
            <CardDescription>Ensuring existing theme colors still work.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-medical-600 rounded-lg flex items-center justify-center text-white font-bold">M2</div>
              <div className="w-12 h-12 bg-medical-500 rounded-lg"></div>
              <div className="w-12 h-12 bg-medical-400 rounded-lg"></div>
              <div className="w-12 h-12 bg-medical-300 rounded-lg"></div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Original medical palette is preserved.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// src/components/UploadAdvert.tsx
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export const UploadAdvert = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return toast({ title: 'No file selected!' })

    const user = (await supabase.auth.getUser()).data.user
    if (!user) return toast({ title: 'Login required' })

    const path = `${user.id}/adverts/${file.name}`
    setUploading(true)

    const { error } = await supabase.storage.from('adverts').upload(path, file, { upsert: true })

    if (error) {
      toast({ title: 'Upload failed', description: error.message })
    } else {
      toast({ title: 'Upload successful', description: file.name })
    }

    setUploading(false)
  }

  return (
    <div className="space-y-4">
      <Input type="file" accept=".pdf,.png,.jpg" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Advert'}
      </Button>
    </div>
  )
}

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AssetMigrationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Asset Migration</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload Assets</TabsTrigger>
          <TabsTrigger value="manage">Manage Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Suspense fallback={<div>Loading...</div>}>
            <AssetUploader />
          </Suspense>
        </TabsContent>

        <TabsContent value="manage">
          <Suspense fallback={<div>Loading...</div>}>
            <AssetManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { migrateAssets, type MigrationProgress } from '@/lib/storage/migration'

function AssetUploader() {
  const [progress, setProgress] = useState<MigrationProgress | null>(null)
  const [contentType, setContentType] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      if (!contentType) {
        alert('Please specify a content type')
        return
      }

      setIsUploading(true)
      try {
        await migrateAssets(files, {
          contentType,
          onProgress: setProgress
        })
      } finally {
        setIsUploading(false)
      }
    }
  })

  return (
    <Card className="p-6">
      <div className="mb-4">
        <Label htmlFor="contentType">Content Type</Label>
        <Input
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          placeholder="e.g., articles, images, documents"
          className="mt-1"
        />
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop files here, or click to select files</p>
        )}
      </div>

      {progress && (
        <div className="mt-6">
          <Progress value={(progress.processed / progress.total) * 100} />
          <div className="mt-2 text-sm text-muted-foreground">
            Processed {progress.processed} of {progress.total} files
            ({progress.succeeded} succeeded, {progress.failed} failed)
          </div>

          {progress.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Upload Errors</AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-32">
                  <ul className="list-disc pl-4">
                    {progress.errors.map((error, index) => (
                      <li key={index}>
                        {error.file}: {error.error}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { listAssets, deleteAsset } from '@/lib/storage/migration'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function AssetManager() {
  const [assets, setAssets] = useState<string[]>([])
  const [selectedContentType, setSelectedContentType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedContentType) {
      loadAssets()
    }
  }, [selectedContentType])

  async function loadAssets() {
    setIsLoading(true)
    try {
      const files = await listAssets(selectedContentType)
      setAssets(files)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(path: string) {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      const success = await deleteAsset(path)
      if (success) {
        await loadAssets()
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <Label htmlFor="selectedContentType">Content Type</Label>
        <Input
          id="selectedContentType"
          value={selectedContentType}
          onChange={(e) => setSelectedContentType(e.target.value)}
          placeholder="e.g., articles, images, documents"
          className="mt-1"
        />
      </div>

      {isLoading ? (
        <div>Loading assets...</div>
      ) : assets.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset}>
                <TableCell>{asset}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(asset)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-muted-foreground">
          No assets found for the selected content type
        </div>
      )}
    </Card>
  )
}
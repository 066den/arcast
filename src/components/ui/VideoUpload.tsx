'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link, Video, X, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { validateVideoFile } from '@/lib/validate'
import { getUploadedVideo } from '@/utils/files'

interface VideoUploadProps {
  onVideoSelect: (videoUrl: string, videoFile?: File) => void
  initialVideoUrl?: string
  className?: string
}

export default function VideoUpload({
  onVideoSelect,
  initialVideoUrl = '',
  className,
}: VideoUploadProps) {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'url'>('upload')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploaded, setIsUploaded] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    const validation = validateVideoFile(file)
    if (validation) {
      toast.error(validation)
      return
    }

    setVideoFile(file)
    // Don't clear videoUrl when selecting a file
    // setVideoUrl('')
    // Don't call onVideoSelect until file is actually uploaded
    // onVideoSelect('', file)
  }

  const handleFileUpload = async () => {
    if (!videoFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const uploadedUrl = await getUploadedVideo(videoFile, 'samples')

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Small delay to show 100% completion
      setTimeout(() => {
        setVideoUrl(uploadedUrl)
        onVideoSelect(uploadedUrl, videoFile)
        toast.success('Video uploaded successfully!')
        setIsUploading(false)
        setUploadProgress(0)
        setIsUploaded(true)
      }, 500)
    } catch (error) {
      console.error('Error uploading video:', error)

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to upload video'

      if (error instanceof Error) {
        if (
          error.message.includes('413') ||
          error.message.includes('Content Too Large')
        ) {
          errorMessage =
            'Video file is too large. Please choose a smaller file or compress your video.'
        } else if (
          error.message.includes('400') ||
          error.message.includes('Bad Request')
        ) {
          errorMessage =
            'Invalid video file. Please check the file format and try again.'
        } else if (
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        ) {
          errorMessage = 'You need to be logged in to upload videos.'
        } else if (error.message.includes('Network')) {
          errorMessage =
            'Network error. Please check your connection and try again.'
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Server error. Please try again later.'
        }
      }

      toast.error(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleUrlChange = (url: string) => {
    setVideoUrl(url)
    setVideoFile(null)
    onVideoSelect(url)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const clearSelection = () => {
    setVideoFile(null)
    setVideoUrl('')
    setIsUploaded(false)
    setUploadProgress(0)
    onVideoSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedTab}
            onValueChange={value => setSelectedTab(value as 'upload' | 'url')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Enter URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label htmlFor="video-file">Upload Video File</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {videoFile ? (
                    <div className="space-y-4">
                      <div
                        className={`flex items-center justify-center gap-2 ${
                          isUploading
                            ? 'text-blue-600'
                            : isUploaded
                              ? 'text-green-600'
                              : 'text-orange-600'
                        }`}
                      >
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isUploaded ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Video className="h-5 w-5" />
                        )}
                        <span className="font-medium">{videoFile.name}</span>
                        {isUploaded && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {videoFile.size > 100 * 1024 * 1024 &&
                          videoFile.size <= 200 * 1024 * 1024 && (
                            <div className="text-orange-600 text-xs mt-1">
                              ⚠️ Large file - will use direct upload (slower but
                              more reliable)
                            </div>
                          )}
                        {videoFile.size > 300 * 1024 * 1024 && (
                          <div className="text-green-600 text-xs mt-1">
                            🚀 Very large file - will use multipart upload
                            (fastest for huge files)
                            <br />⚡ Optimized for maximum speed and reliability
                          </div>
                        )}
                        {videoFile.size > 100 * 1024 * 1024 &&
                          videoFile.size <= 300 * 1024 * 1024 && (
                            <div className="text-blue-600 text-xs mt-1">
                              📤 Large file - will use direct upload (reliable
                              method)
                              <br />⏳ This may take several minutes
                            </div>
                          )}
                      </div>

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">
                              {videoFile.size > 300 * 1024 * 1024
                                ? 'Uploading very large video with multipart (optimized for speed)...'
                                : videoFile.size > 100 * 1024 * 1024
                                  ? 'Uploading large video (this may take several minutes)...'
                                  : 'Uploading video...'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-center text-xs text-muted-foreground">
                            {uploadProgress}% complete
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-center">
                        {!isUploaded && (
                          <Button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                            size="sm"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Video'
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={clearSelection}
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Drop video file here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            handleFileSelect(e.target.files[0])
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: MP4, WebM, OGG, AVI, MOV, QuickTime (max
                  1000MB)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter a direct link to your video file
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {(videoFile || videoUrl) && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {videoFile ? videoFile.name : 'Video URL'}
                  </span>
                  {isUploaded && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Uploaded
                    </span>
                  )}
                </div>
                <Button
                  onClick={clearSelection}
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {videoUrl && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {videoUrl}
                </p>
              )}
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

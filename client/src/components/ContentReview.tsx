import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  History,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReviewComment {
  id: string
  user: string
  content: string
  timestamp: string
  type: 'suggestion' | 'approval' | 'revision'
}

interface ContentSection {
  id: string
  content: string
  status: 'pending' | 'approved' | 'needs_revision'
  comments: ReviewComment[]
  version: number
}

interface ContentReviewProps {
  content: ContentSection[]
  onUpdateContent: (updatedContent: ContentSection[]) => void
}

export function ContentReview({ content, onUpdateContent }: ContentReviewProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")

  const getStatusBadge = (status: ContentSection['status']) => {
    const config = {
      pending: { className: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle },
      approved: { className: "bg-green-500/10 text-green-500", icon: CheckCircle },
      needs_revision: { className: "bg-red-500/10 text-red-500", icon: History },
    }
    return config[status]
  }

  const addComment = (sectionId: string, type: ReviewComment['type']) => {
    if (!newComment.trim()) return

    const updatedContent = content.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          comments: [
            ...section.comments,
            {
              id: `comment-${Date.now()}`,
              user: "Current User", // Replace with actual user
              content: newComment,
              timestamp: new Date().toISOString(),
              type,
            },
          ],
        }
      }
      return section
    })

    onUpdateContent(updatedContent)
    setNewComment("")
  }

  const updateStatus = (sectionId: string, status: ContentSection['status']) => {
    const updatedContent = content.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          status,
          version: status === 'needs_revision' ? section.version + 1 : section.version,
        }
      }
      return section
    })

    onUpdateContent(updatedContent)
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Sections</CardTitle>
          <CardDescription>Review and approve content sections</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {content.map((section) => (
                <Card
                  key={section.id}
                  className={`cursor-pointer hover:bg-accent/50 ${
                    selectedSection === section.id ? "bg-accent/50" : ""
                  }`}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <CardHeader>
                    <CardTitle>{section.id}</CardTitle>
                    <CardDescription>
                      {section.content.length > 100
                        ? section.content.slice(0, 100) + "..."
                        : section.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusBadge(section.status).className}>
                        {getStatusBadge(section.status).icon && (
                          <span className="mr-2">
                            {React.createElement(getStatusBadge(section.status).icon, { className: "h-4 w-4" })}
                          </span>
                        )}
                        {section.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addComment(section.id, 'suggestion')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addComment(section.id, 'approval')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addComment(section.id, 'revision')}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="mt-4"
                    />
                    <div className="mt-4">
                      {section.comments.map((comment) => (
                        <Card key={comment.id} className="mt-2">
                          <CardHeader>
                            <CardTitle>{comment.user}</CardTitle>
                            <CardDescription>
                              {comment.timestamp}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={comment.content}
                              onChange={(e) => {
                                const updatedContent = content.map(s => {
                                  if (s.id === section.id) {
                                    const newComments = [...s.comments]
                                    newComments[newComments.indexOf(comment)] = {
                                      ...comment,
                                      content: e.target.value,
                                    }
                                    return { ...s, comments: newComments }
                                  }
                                  return s
                                })
                                onUpdateContent(updatedContent)
                              }}
                              placeholder="Edit comment..."
                              className="mt-4"
                            />
                            <div className="mt-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updatedContent = content.map(s => {
                                    if (s.id === section.id) {
                                      const newComments = [...s.comments]
                                      newComments.splice(newComments.indexOf(comment), 1)
                                      return { ...s, comments: newComments }
                                    }
                                    return s
                                  })
                                  onUpdateContent(updatedContent)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Content Review Workflow</CardTitle>
          <CardDescription>
            Manage and review content sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="section" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="section">Sections</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>
            <TabsContent value="section">
              {/* Add section review components here */}
            </TabsContent>
            <TabsContent value="workflow">
              {/* Add workflow review components here */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

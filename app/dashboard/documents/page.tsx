"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, FileText, Calendar, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DocumentItem } from "@/lib/types/api-responses"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getMyDocuments()
      setDocuments(response.data || [])
    } catch (err) {
      setError("Failed to load documents")
      console.error("Error fetching documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const isImage = (url: string) => /\.(png|jpe?g|gif|bmp|webp)$/i.test(url)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Documents</h2>
          <p className="text-gray-600 text-sm md:text-base">All documents uploaded for your lease or tenancy</p>
        </div>
        <Button onClick={fetchDocuments} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Your Documents</CardTitle>
          <p className="text-gray-600">Click to view or download your documents</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDocuments} variant="outline">Try Again</Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600 mb-4">You don't have any uploaded documents yet.</p>
              <Button onClick={fetchDocuments} variant="outline">Refresh</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {isImage(doc.documentUrl) ? (
                          <img
                            src={doc.documentUrl}
                            alt={doc.documentName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">
                          {doc.documentName}
                        </h4>
                        <p className="text-xs text-gray-600">Purpose: {doc.purpose}</p>
                        <p className="text-xs text-gray-500 mt-1">Uploaded by: {doc.uploadedByName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        View Document
                      </a>
                      <div className="flex items-center gap-2 mt-1 justify-end text-gray-500 text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

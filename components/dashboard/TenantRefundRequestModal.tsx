import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"

interface TenantRefundRequestModalProps {
  isOpen: boolean
  onClose: () => void
  leaseId: string
  unitId: string
  propertyId: string
  onSubmitted?: () => void
}

export const TenantRefundRequestModal: React.FC<TenantRefundRequestModalProps> = ({
  isOpen,
  onClose,
  leaseId,
  unitId,
  propertyId,
  onSubmitted,
}) => {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    refundFor: "",
    description: "",
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.refundFor.trim()) return

    try {
      setLoading(true)
      const request = {
        title: "Refund Request",
        requesterType: "TENANT",
        requestedByUserId: user?.userId,
        leaseId,
        unitId,
        propertyId,
        category: "REFUND",
        priority: "HIGH",
        subcategory: formData.refundFor,
        description: formData.description,
      }

      console.log("Submitting refund request:", request)
      await apiClient.createWorkOrder(request)
      setFormData({ refundFor: "", description: "" })
      onClose()
      onSubmitted?.()
    } catch (err) {
      console.error("Failed to submit refund request", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Refund For</Label>
            <Input
              placeholder="E.g. Overpaid rent"
              value={formData.refundFor}
              onChange={(e) => setFormData({ ...formData, refundFor: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Provide any extra details (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

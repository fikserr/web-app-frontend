import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

function CommentModal({
  showCommentModal = false,
  setShowCommentModal = () => {},
  comment = '',
  setComment = () => {},
  setShowPaymentModal = () => {},
  basket = [],
  counts = {},
}) {
  // Format amount to UZS currency
  const formatCurrency = amount =>
    new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('UZS', "so'm")

  // Called when user confirms the comment
  function handleConfirm() {
    setShowCommentModal(false)
    setShowPaymentModal(true)
  }

  // Calculate total sum
  const totalAmount = basket.reduce(
    (acc, item) => acc + item.price * (counts[item.productId]?.count || 0),
    0
  )

  return (
    <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
      <DialogContent
        className="bg-white text-black rounded-xl max-w-sm w-10/12 dark:bg-gray-700 dark:text-white"
        aria-describedby={"Kommetariya modali"}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-semibold text-lg dark:text-white">
            Buyurtmangiz uchun izoh qoldirasizmi?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 flex flex-col gap-4">
          <Textarea
            placeholder="Izoh..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full border-gray-300 resize-y h-36"
          />
          <p className="text-lg">
            Jami summa: {formatCurrency(totalAmount)}
          </p>
        </div>

        <DialogFooter className="flex justify-between mt-3 flex-row">
          <Button
            variant="outline"
            className="w-1/2 mr-2 dark:text-white"
            onClick={() => {
              setComment('ixtiyoriy')
              setShowCommentModal(false)
            }}
          >
            Ortga qaytish
          </Button>

          <Button
            className="bg-[rgb(22,113,98)] w-1/2 text-white"
            onClick={handleConfirm}
          >
            Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CommentModal

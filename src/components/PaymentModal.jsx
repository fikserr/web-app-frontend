import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import clickUp from '../assets/clickUp.png'
import payMe from '../assets/payme.png'
import uzumLogo from '../assets/uzumLogo.png'

function PaymentModal({
  showPaymentModal,
  setShowPaymentModal,
  handleConfirmOrder,
}) {
  // fallback safety: if prop isn’t passed correctly
  const safeHandle = type => {
    if (typeof handleConfirmOrder === 'function') {
      handleConfirmOrder(type)
    } else {
      console.error('handleConfirmOrder is not a function.')
    }
  }

  return (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className='bg-white text-black rounded-xl max-w-sm w-10/12 dark:bg-gray-700 dark:text-white' aria-describedby={"tulov turi modali"} >
        <DialogHeader>
          <DialogTitle className='text-center font-semibold text-lg dark:text-white'>
            To‘lov turini tanlang
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3 mt-4'>
          <Button
            onClick={() => safeHandle('click')}
            className='bg-[#00aaff] text-white flex items-center justify-center gap-2 py-3'
          >
            <img src={clickUp} alt='Click logo' className='w-6 h-6' />
            Click
          </Button>

          <Button
            onClick={() => safeHandle('payme')}
            className='bg-[#00B2E3] text-white flex items-center justify-center gap-2 py-3'
          >
            <img src={payMe} alt='Payme logo' className='w-6 h-6' />
            Payme
          </Button>

          <Button
            onClick={() => safeHandle('uzum')}
            className='bg-[#8e44ad] text-white flex items-center justify-center gap-2 py-3'
          >
            <img src={uzumLogo} alt='Uzum logo' className='w-6 h-6' />
            Uzum
          </Button>

          <Button
            onClick={() => safeHandle('qarzga')}
            variant='outline'
            className='text-black dark:text-white py-3'
          >
            Qarzga olish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal

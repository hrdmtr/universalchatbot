import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

interface CreateBotModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string) => Promise<void>
}

export default function CreateBotModal({
  isOpen,
  onClose,
  onCreate
}: CreateBotModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onCreate(name, description)
      handleClose()
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新しいボットを作成"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="botName" className="block text-sm font-medium text-gray-700">
            ボット名 *
          </label>
          <Input
            id="botName"
            value={name}
            onChange={setName}
            required
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="botDescription" className="block text-sm font-medium text-gray-700">
            説明（任意）
          </label>
          <Textarea
            id="botDescription"
            value={description}
            onChange={setDescription}
            rows={3}
            maxLength={500}
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? '作成中...' : 'ボットを作成'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
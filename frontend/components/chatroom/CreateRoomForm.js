import { useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import EventButton from '@/components/event/EventButton'
import styles from '@/styles/Chat.module.css'
import websocketService from '@/services/websocketService'

export default function CreateRoomForm({ show, onHide, ws, currentUser }) {
  const [roomName, setRoomName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roomName.trim()) return

    websocketService.send({
      type: 'createRoom',
      roomName: roomName,
      fromID: currentUser,
    })

    setRoomName('')
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide} className={styles.modal}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>建立新聊天室</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>聊天室名稱</Form.Label>
            <Form.Control
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="輸入聊天室名稱..."
              className={styles.modalInput}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <EventButton
              variant="outline"
              onClick={onHide}
              className={styles.modalCancelButton}
            >
              取消
            </EventButton>
            <EventButton type="submit" className={styles.modalSubmitButton}>
              建立
            </EventButton>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

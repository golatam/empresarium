CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN orders o ON o.id = c.order_id
    WHERE c.id = messages.conversation_id
    AND (o.client_id = auth.uid() OR o.partner_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages to their conversations" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN orders o ON o.id = c.order_id
    WHERE c.id = messages.conversation_id
    AND (o.client_id = auth.uid() OR o.partner_id = auth.uid())
  )
);
CREATE POLICY "Users can mark messages as read" ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN orders o ON o.id = c.order_id
    WHERE c.id = messages.conversation_id
    AND (o.client_id = auth.uid() OR o.partner_id = auth.uid())
  )
) WITH CHECK (is_read = true);
CREATE POLICY "Admins can view all messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

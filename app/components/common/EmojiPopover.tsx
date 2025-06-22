// EmojiPopover.tsx
import React, { useState } from 'react';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';

interface EmojiPopoverProps {
  onSelect: (emoji: string) => void;
}

const EmojiPopover: React.FC<EmojiPopoverProps> = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emoji: any) => {
    onSelect(emoji.native);
    setShowPicker(false);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>
      {showPicker && (
        <div style={{ position: 'absolute', zIndex: 1000 }}>
          <Picker data={emojiData} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default EmojiPopover;

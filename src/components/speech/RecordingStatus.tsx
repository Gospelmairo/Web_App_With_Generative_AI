
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";

interface RecordingStatusProps {
  isListening: boolean;
  onToggle: () => void;
}

const RecordingStatus = ({ isListening, onToggle }: RecordingStatusProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Input</h3>
        <Badge variant={isListening ? "destructive" : "secondary"}>
          {isListening ? "Recording..." : "Ready"}
        </Badge>
      </div>
      
      <Button
        onClick={onToggle}
        className={`w-full h-16 text-white font-semibold transition-all duration-200 flex items-center gap-3 ${
          isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="h-6 w-6" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-6 w-6" />
            Start Recording
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="text-center text-sm text-blue-600">
          Recording... Click "Stop Recording" to finish
        </div>
      )}
    </>
  );
};

export default RecordingStatus;

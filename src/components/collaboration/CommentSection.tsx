import React, { useState } from 'react';
import { MessageSquare, Check, X } from 'lucide-react';
import { NodeComment } from '../../types/node';

interface CommentSectionProps {
  comments: NodeComment[];
  onAddComment: (content: string, action?: 'isolate' | 'restore') => void;
  onApproveComment: (commentId: string) => void;
  onRejectComment: (commentId: string) => void;
}

export function CommentSection({ 
  comments, 
  onAddComment, 
  onApproveComment, 
  onRejectComment 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'isolate' | 'restore' | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim(), selectedAction);
      setNewComment('');
      setSelectedAction(undefined);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Comments
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Add a comment..."
          rows={2}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setSelectedAction('isolate')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedAction === 'isolate'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Suggest Isolation
          </button>
          <button
            type="button"
            onClick={() => setSelectedAction('restore')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedAction === 'restore'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Suggest Restore
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded-md text-sm bg-indigo-500 text-white ml-auto"
          >
            Send
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.userName}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(comment.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {comment.content}
            </p>
            {comment.action && comment.status === 'pending' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Suggested: {comment.action === 'isolate' ? 'Isolate' : 'Restore'}
                </span>
                <button
                  onClick={() => onApproveComment(comment.id)}
                  className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => onRejectComment(comment.id)}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
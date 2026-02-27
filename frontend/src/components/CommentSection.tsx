import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useAddComment } from '../hooks/useAddComment';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { ChannelNameDisplay } from './ChannelNameDisplay';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { identity } = useInternetIdentity();
  const { data: comments, isLoading } = useComments(videoId);
  const addCommentMutation = useAddComment();

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    await addCommentMutation.mutateAsync({
      videoId,
      content: commentText.trim(),
    });

    setCommentText('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments {comments && `(${comments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAuthenticated && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={addCommentMutation.isPending}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="gap-2"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Comment
              </Button>
            </div>
          </form>
        )}

        {!isAuthenticated && (
          <div className="text-center py-4 text-muted-foreground">
            Please sign in to leave a comment
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const commentDate = new Date(Number(comment.timestamp) / 1000000);
              return (
                <div key={Number(comment.id)} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-medium">
                      {comment.author.toString().slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        <ChannelNameDisplay principal={comment.author} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(commentDate, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

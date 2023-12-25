import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { StarIcon } from 'lucide-react';
import { Textarea } from './ui/textarea';

const StarRating = ({ rating, onClick, className }) => {
  const maxRating = 5;

  return (
    <div>
      {[...Array(maxRating)].map((_, index) => (
        <StarIcon
          key={index}
          fill={index < rating ? 'currentColor' : 'none'}
          onClick={() => onClick(index + 1)} // Ratings start from 1
          className={cn(
            `inline-block ${
              index < rating ? 'text-yellow-500' : 'text-gray-300'
            }`,
            className,
          )}
        />
      ))}
    </div>
  );
};

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState(null);
  const { tripId } = useParams();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const postComment = async (formData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/comments`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        toast.error('登入已過期，請先登入');
        return;
      }

      const json = await response.json();
      if (json.error) {
        toast.error(json.error);
        return;
      }

      toast.success(json.data);
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => setInput(e.target.value);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
    }
    formData.append('user_id', user.id);
    formData.append('trip_id', tripId);
    formData.append('comment', input);
    formData.append('rating', rating);

    postComment(formData);
    setInput('');
    setFiles(null);
    setRating(0);
  };

  const fetchComments = useCallback(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/comments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((json) => {
        if (json.data) {
          setComments(json.data);
        }
      });
  }, []);

  useEffect(() => {
    fetchComments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <Card className="bg-white p-4 mx-16 my-4">
      <div className="flex justify-between ">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">評論</h2>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>新增評論</Button>
            </DialogTrigger>
            <DialogContent>
              <CardHeader>
                <CardTitle>新增評論</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid space-y-2">
                  <div className="flex justify-center">
                    <StarRating
                      className="cursor-pointer text-3xl mb-4"
                      rating={rating}
                      onClick={handleRatingChange}
                    />
                  </div>

                  <Textarea
                    type="text"
                    value={input}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded-lg p-2 min-h-[100px]"
                    placeholder="寫下對這個行程的心得吧！"
                    maxLength="500"
                    required
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {input.length} / 500
                  </p>

                  <Label htmlFor="photos" className="pt-2">
                    上傳圖片
                  </Label>
                  <Input
                    type="file"
                    name="photos"
                    id="photos"
                    accept="image/*"
                    className="cursor-pointer"
                    encType="multipart/form-data"
                    onChange={handleFileChange}
                    multiple
                  />
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button className="w-full bg-gray-500">取消</Button>
                    </DialogClose>
                    <Button
                      className="w-full"
                      type="submit"
                      onClick={() => {
                        if (input) {
                          setOpen(false);
                        }
                      }}
                    >
                      評論
                    </Button>
                  </div>
                </form>
              </CardContent>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {comments && comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="flex items-start space-x-2 my-2">
            <Avatar>
              <AvatarImage src={comment.photo} />
              <AvatarFallback>{comment.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {comment.username}
                <StarRating
                  className="text-sm -mt-2"
                  rating={comment.rating}
                  onClick={() => null}
                />
              </div>
              <p className="text-sm text-gray-800">{comment.comment}</p>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              {comment.photos && (
                <div className="flex space-x-1">
                  {comment.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>尚無評論</p>
      )}
    </Card>
  );
};

export default Comment;

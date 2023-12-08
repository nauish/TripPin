import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IoIosStar } from 'react-icons/io';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const StarRating = ({ rating, onClick }) => {
  const maxRating = 5;

  return (
    <div>
      {[...Array(maxRating)].map((_, index) => (
        <IoIosStar
          key={index}
          onClick={() => onClick(index + 1)} // Ratings start from 1
          className={`cursor-pointer inline-block ${
            index < rating ? 'text-yellow-500' : 'text-gray-300'
          } text-lg`}
        />
      ))}
    </div>
  );
};

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [rating, setRating] = useState(0);
  const { tripId } = useParams();

  const postComment = (comment) => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/comments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(comment),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        setComments([...comments, { username: user.name, ...json.data[0] }]);
      });
  };

  const handleChange = (e) => setInput(e.target.value);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postComment({
      user_id: user.id,
      trip_id: tripId,
      comment: input,
      rating: rating,
    });
    setInput('');
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/comments`)
      .then((response) => response.json())
      .then((json) => setComments(json.data));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <Card className="bg-white p-4 mx-16 my-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">評論</h2>
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 mt-4"
      >
        <textarea
          type="text"
          value={input}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-lg p-2"
          placeholder="寫下對這個行程的心得吧！"
        />
        <StarRating rating={rating} onClick={handleRatingChange} />
        <Button type="submit">評論</Button>
      </form>
      {comments &&
        comments.map((comment, index) => (
          <div key={index} className="flex items-start space-x-2 my-2">
            <Avatar>
              <AvatarImage src={comment.photo} />
              <AvatarFallback>{comment.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {comment.username}
                <StarRating rating={comment.rating} />
              </div>
              <p className="text-sm text-gray-800">{comment.comment}</p>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
    </Card>
  );
};

export default Comment;

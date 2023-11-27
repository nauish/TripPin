import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [rating, setRating] = useState(5);
  const params = useParams();

  const postComment = (comment) => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${
        params.tripId
      }/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const handleRatingChange = (e) => setRating(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    postComment({
      user_id: user.id,
      trip_id: params.tripId,
      comment: input,
      rating: rating,
    });
    setInput('');
  };

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${
        params.tripId
      }/comments`,
    )
      .then((response) => response.json())
      .then((json) => setComments(json.data));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">評論</h1>
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 mt-4"
      >
        <input
          type="text"
          value={input}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-lg p-2"
          placeholder="Write a comment..."
        />
        <select
          value={rating}
          onChange={handleRatingChange}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-lg px-4 py-2"
        >
          Submit
        </button>
      </form>
      {comments.map((comment, index) => (
        <div key={index} className="flex items-start space-x-2 mb-2">
          {comment.photo ? (
            <img
              src={comment.photo}
              alt={comment.username}
              className="w-10 h-10 rounded-full"
            />
          ) : undefined}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {comment.username}
            </p>
            <p className="text-sm text-gray-700">{comment.comment}</p>
            <div className="flex items-center space-x-1">
              {comment.rating}
              <span className="text-sm text-gray-600">
                {formatDate(comment.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comment;

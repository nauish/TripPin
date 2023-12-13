import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const AddTrip = () => {
  return (
    <Link to="/trip">
      <Button className="my-4">新增行程</Button>
    </Link>
  );
};

export default AddTrip;

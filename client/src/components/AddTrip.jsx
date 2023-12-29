import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const AddTrip = () => {
  return (
    <Link to="/trips" className="mx-auto">
      <Button className="mt-20 -mb-10">新增行程</Button>
    </Link>
  );
};

export default AddTrip;

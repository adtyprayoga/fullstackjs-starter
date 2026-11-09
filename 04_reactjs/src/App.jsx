import Car from './components/Car'
import { useEffect, useState } from 'react';

const App = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetch('api/v1/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error(err));

    }, []);
    
  console.log(cars)

  return (
    <div>
      <h1>Welcome so Car Store</h1>
      <ul>
        {
          cars.map((car) => (
            <Car key={car.id} {...car}/>
          ))
        }
      </ul>
    </div>
  )
}

export default App
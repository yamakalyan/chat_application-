import { useEffect, useState } from "react";
import { usersListFetch } from "../helpers/Helper";
import { useNavigate } from "react-router-dom";

const View = () => {
  const [users, setUsers] = useState([]);
  const [userID, setUserID] = useState("");
  const navigator = useNavigate();

  useEffect(() => {
    const fetchingUsers = async () => {
      const values = await usersListFetch();
      setUsers(values);
    };
    fetchingUsers();
  }, []);

  const mapping = users.map((user, id) => {
    return (
      <option key={id} value={user.user_id}>
        {user.user_name}
      </option>
    );
  });

  const handleSubmit = () => {
    navigator(`/messages/${userID}`);
  };

  return (
    <div>
      <div className="container">
        <div className="row my-5 py-5">
          <div className="col mx-auto">
            <form onSubmit={handleSubmit}>
              <div>
                <select
                  className="form-control"
                  id="user-select"
                  onChange={(e) => setUserID(e.target.value)}
                >
                  <option defaultValue>..</option>
                  {mapping}
                </select>
                <div className="mt-4">
                  <button className="btn btn-primary" type="submit">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;

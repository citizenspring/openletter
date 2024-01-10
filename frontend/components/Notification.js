const Notification = ({ icon, title, message }) => (
  <div className="my-2 py-3">
    <div className="mx-2 p-2">
      <div className="text-center justify-center">
        <div className="flex justify-center">
          <img src={`/favicon.png`} width={64} />
        </div>
        <div>
          <h2 className="text-2xl my-2">{title}</h2>
        </div>
      </div>
      <div className="my-4 text-center">{message}</div>
    </div>
  </div>
);

export default Notification;

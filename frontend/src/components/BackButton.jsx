import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;

    if (
      typeof historyIndex === "number" &&
      historyIndex > 0
    ) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="global-back-wrapper">
      <button
        type="button"
        className="global-back-btn"
        onClick={handleBack}
      >
        <i className="bi bi-arrow-left"></i>

        Back
      </button>
    </div>
  );
}

export default BackButton;
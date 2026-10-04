import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function VerifyOTP() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("registerEmail");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const [seconds, setSeconds] = useState(300);
  const [resendSeconds, setResendSeconds] = useState(30);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds((value) => {
        if (value <= 1) {
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const verify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setMessage("Please enter a 6 digit OTP");
      return;
    }

    if (seconds === 0) {
      setMessage("OTP expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/verify-otp", {
        email,
        otp
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      sessionStorage.removeItem("registerEmail");

      navigate("/profile");

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendSeconds > 0) {
      setMessage(
        `Please wait ${resendSeconds} seconds`
      );

      return;
    }

    setResendLoading(true);
    setMessage("");

    try {
      const response = await API.post(
        "/auth/resend-otp",
        { email }
      );

      setOtp("");
      setSeconds(300);
      setResendSeconds(30);

      setMessage(
        response.data.message || "New OTP sent"
      );

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Could not resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return <NavigateBack />;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="otp-icon">
          ✉
        </div>

        <h2>Verify Email</h2>

        <p className="auth-subtitle">
          {email}
        </p>

        <form onSubmit={verify}>

          <input
            className="otp-input"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />

          {seconds > 0 ? (
            <p className="timer">
              OTP expires in{" "}
              {minutes}:
              {String(remainingSeconds).padStart(2, "0")}
            </p>
          ) : (
            <p className="timer">
              OTP expired
            </p>
          )}

          <button
            type="submit"
            className="primary-button full"
            disabled={
              loading ||
              otp.length !== 6 ||
              seconds === 0
            }
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </form>

        <button
          className="text-button"
          onClick={resend}
          disabled={
            resendLoading ||
            resendSeconds > 0
          }
        >
          {resendLoading
            ? "Sending..."
            : resendSeconds > 0
            ? `Resend OTP in ${resendSeconds}s`
            : "Resend OTP"}
        </button>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

function NavigateBack() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>Registration not found</h2>

        <button
          className="primary-button full"
          onClick={() => navigate("/register")}
        >
          Register Again
        </button>

      </div>
    </div>
  );
}

export default VerifyOTP;
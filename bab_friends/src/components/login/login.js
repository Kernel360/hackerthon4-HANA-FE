import React, { useState, useEffect } from "react";
import { storeTokens, logout } from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

export const Navigation = ({ setPage }) => {
  // 로그인 상태 확인 (localStorage에 토큰이 있는지 확인)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signupModalVisible, setSignupModalVisible] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
  }, []);

  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  const handleCloseLoginModal = () => {
    setLoginModalVisible(false);
  };

  const handleCloseSignupModal = () => {
    setSignupModalVisible(false);
  };

  const handleUserButtonClick = () => {
    setDropdownVisible((prev) => !prev); 
  };
  const handleDropdownItemClick = (action) => {
    setDropdownVisible(false); // 드롭다운 닫기
    setPage(action); 
  };

  const handlePasswordChange = () => {
    setPage("passwordChange"); 
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token found for logout.");
      } else {
        await fetch(`${API_BASE_URL}/users/logout`, {
          method: "PATCH",
          headers: {
            "Authorization": token, // Bearer 토큰 포함
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("로그아웃 에러:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setDropdownVisible(false);
      window.location.reload();
    }
  };

  return (
    <nav className="navbar">
  <div className="logo-container">
    <span className="site-title" onClick={() => setPage("meetings")}>
      <span className="bap">BAP</span><span className="pool">POOL</span>
    </span>
  </div>

  <div className="nav-container">  
  <div className="nav-links">
    <span className="nav-item">
      <a href="#" className="pool-link" onClick={() => setPage("meetings")}>POOL</a>
    </span>
    <span className="nav-item">
      <a href="#" className="review-link" onClick={() => setPage("reviews")}>REVIEW</a>
    </span>
  </div>
</div>

{isLoggedIn ? (
        <div className="user-menu">
          <button className="user-button" onClick={handleUserButtonClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4ZM12 14C9.32686 14 4 15.3431 4 18V20H20V18C20 15.3431 14.6731 14 12 14Z" fill="currentColor" />
            </svg>
          </button>
          {dropdownVisible && (
             <div className="dropdown-menu">
             <a href="#" onClick={() => handleDropdownItemClick("settings")}>설정</a>
             <a href="#" onClick={() => handleDropdownItemClick("password")}>비밀번호 변경</a> 
             <a href="#" onClick={() => { handleDropdownItemClick(""); handleLogout(); }}>로그아웃</a>
           </div>
          )}
        </div>
      ) : (
        <>
          <button className="login-button" onClick={handleLoginClick}>로그인</button>
          {loginModalVisible && (
            <LoginModal
              onClose={handleCloseLoginModal}
              setIsLoggedIn={setIsLoggedIn}
              setSignupModalVisible={setSignupModalVisible}
            />
          )}
          {signupModalVisible && (
            <SignupModal
              onClose={handleCloseSignupModal}
              setLoginModalVisible={setLoginModalVisible}
            />
          )}
        </>
      )}
</nav>
  );
};

// 로그인 모달
const LoginModal = ({ onClose, setIsLoggedIn, setSignupModalVisible }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        storeTokens(data.accessToken, data.refreshToken);
        setIsLoggedIn(true);
        onClose();
        window.location.reload(); // 로그인 후 새로고침
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="login-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-modal-content">
        <button className="close-button-login" onClick={onClose}>X</button>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-button-form">로그인</button>
        </form>
        <a href="#" className="auth-toggle-link" onClick={() => { setSignupModalVisible(true); onClose(); }}>
          회원가입
        </a>
      </div>
    </div>
  );
};

// 회원가입 모달
const SignupModal = ({ onClose, setLoginModalVisible }) => {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, nickname, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입 성공!");
        onClose();
        setLoginModalVisible(true); 
      } else {
        alert(data.message || "이미 존재하는 아이디입니다.");
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="signup-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="signup-modal-content">
        <button className="close-button-login" onClick={onClose}>X</button>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="nickname">닉네임:</label>
            <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-button-form">가입하기</button>
        </form>
      </div>
    </div>
  );
};

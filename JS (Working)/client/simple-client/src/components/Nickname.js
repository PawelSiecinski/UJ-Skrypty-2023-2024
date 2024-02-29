import React, { useState, useEffect } from "react";

const Nickname = ({ onNicknameChange }) => {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    if (storedNickname) {
      setNickname(storedNickname);
      onNicknameChange(storedNickname);
    }
  }, [onNicknameChange]);

  const handleNicknameChange = (e) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    onNicknameChange(newNickname);
    localStorage.setItem("nickname", newNickname);
  };

  return (
    <>
    Podaj nazwę: <br/><br/>
    <input
      type="text"
      placeholder="Nazwa uzytkownika"
      value={nickname}
      onChange={handleNicknameChange}
    />
    </>
  );
};

export default Nickname;

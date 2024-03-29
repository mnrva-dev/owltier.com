package auth

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/mnrva-dev/owltier.com/server/db"
	"github.com/mnrva-dev/owltier.com/server/jsend"
	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var form = &RequestForm{}
	if err := form.Parse(r); err != nil {
		jsend.ErrorWithCode(w, 400, "invalid form data")
		return
	}

	// get user from DB
	var user = &db.UserSchema{}
	err := db.Fetch(&db.UserSchema{
		Username: form.Username,
	}, user)
	// if we didnt get NotFound error...
	if err == nil {
		jsend.Fail(w, http.StatusConflict, map[string]interface{}{
			"username": "user with this username already exists",
		})
		return
	} // TODO There is probably a better way to make sure this is just a
	// "Not Found" error and not an actual error

	user.CreatedAt = time.Now().Unix()
	user.LastLoginAt = time.Now().Unix()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(form.Password), bcrypt.DefaultCost)
	if err != nil {
		jsend.Error(w, "internal server error")
		return
	}
	user.Password = string(hashedPassword)

	session := uuid.NewString()

	user.Session = session
	user.Username = form.Username

	err = db.Create(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     SESSION_COOKIE,
		Value:    session,
		Path:     "/",
		Expires:  time.Now().Add(time.Hour),
		HttpOnly: true,
		Secure:   true,
	})
	jsend.Success(w, map[string]interface{}{
		"username": user.Username,
	})
}

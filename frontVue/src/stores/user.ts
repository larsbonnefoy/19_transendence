import { defineStore } from 'pinia'
import axios from "axios"
import {type UserInfo} from '../types' 

export const useUserStore = defineStore('user', {
    state: () => ({
        // for data that is not yet loaded
        user: null as UserInfo | null,
    }),
    getters: {
        getUser: (state): UserInfo | null => state.user,
        getUserName: (state) => state.user?.username,
        getStatus: (state) => state.user?.status,
        getImg: (state) => state.user?.photo,
        getFriends: (state) => state.user?.friends,
        getLogin42: (state) => state.user?.login42,
    },
    actions: {
        async fetchUser() {
          try {
                console.log("fetch user : " + sessionStorage.getItem('jwt_token'));
                const data = await axios.post('http://localhost:3000/api42/getLoggedUser/', {token: sessionStorage.getItem('jwt_token')});
                this.user = data.data;
                console.log("fetched user")
                console.log(data.data);
            }
            catch (error) {
            //   alert(error);
              console.log("fetch user error : " + error);
			  this.user = null;
          }
        },
        async setName(newUsername:string) {
            if (this.user) {
                const oldUsername = this.user.username;
                //try {                    
                    await axios.get('http://localhost:3000/user/change_username/', { params: { old: oldUsername, new: newUsername , token: sessionStorage.getItem('jwt_token')} });
                    this.user.username = newUsername;
                    /*
                    return new Promise<number>((resolve) => {
                        resolve(200);
                    });
                //}
                //catch (error) {
                    return new Promise<number>((reject) => {
                        reject(409);
                    });
                // }
                */
            }
        },
        async addFriend(newFriend: string) {
            try {
                const resLogin = await axios.get(`http://localhost:3000/user/LogFromUser:${newFriend}`)
                console.log(resLogin.data.login42);
                const res = await axios.get("http://localhost:3000/user/set_friends", {
                    params: {
                        f1: this.user?.username,
                        f2: newFriend
                    }
                })
                
                this.user?.friends.push(resLogin.data.login42);

            }
            catch (error) {
                console.log(error);
            }
        },
        async removeFriend(FriendtoRemove: string) {
            try {
                const resLogin = await axios.get(`http://localhost:3000/user/LogFromUser:${FriendtoRemove}`)
                const res = await axios.get("http://localhost:3000/user/unset_friends", {
                    params: {
                        f1: this.user?.username,
                        f2: FriendtoRemove
                    }
                })
                if (this.user) {
                    this.user.friends = this.user?.friends.filter(name => name !== resLogin.data.login42)
                }
            }
            catch (error) {
                console.log(error);
            }
        },
      },
     persist: true,
  })
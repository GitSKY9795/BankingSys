(async ()=>{
  try{
    const res = await fetch('http://localhost:3000/api/auth/request-password-reset',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'skyddu3278@gmail.com' })
    });
    console.log('status', res.status);
    console.log(await res.text());
  }catch(err){
    console.error(err);
  }
})();

const response = await fetch(
  "https://graph.facebook.com/v23.0/1174751509060260?fields=display_phone_number,verified_name,code_verification_status,name_status,quality_rating&access_token=YOUR_ACCESS_TOKEN"
);

const data = await response.json();
console.log(data);
// curl -G "https://graph.facebook.com/v23.0/<PHONE_NUMBER_ID>" \
// -d "fields=display_phone_number,verified_name,code_verification_status,name_status,quality_rating" \
// -d "access_token=<PERMANENT_ACCESS_TOKEN>"
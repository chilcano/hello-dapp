try {
  await contract.transfer(addr, amount);
} catch (err) {
  alert("Error: " + err.message);
}


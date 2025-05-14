import Swal from 'sweetalert2';

export function useSwal() {
  // Success Alert
  function alertSucess(message: string) {
    return Swal.fire({
      title: 'Sucesso',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  // Success Alert with Action
  function alertSucessAction(message: string) {
    return Swal.fire({
      title: 'Sucesso',
      text: message,
      icon: 'success',
      showCancelButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }

  // Warning Alert with Custom Title
  function alertWarningTitle(title: string, message: string) {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok',
    });
  }

  // Warning Alert
  function alertWarning(message: string) {
    return Swal.fire({
      title: 'Aviso',
      text: message,
      icon: 'warning',
      allowOutsideClick: false, // Prevents closing by clicking outside
      allowEscapeKey: false,
      confirmButtonText: 'Ok',
    });
  }

  // Error Alert
  function alertError(message: string) {
    return Swal.fire({
      title: 'Erro',
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
    });
  }

  // Info Alert
  function alertInfo(message: string) {
    return Swal.fire({
      title: 'Informação',
      text: message,
      icon: 'info',
      confirmButtonText: 'Ok',
    });
  }

  // Warning Alert with Confirmation Action
  function alertWarningAction(message: string) {
    return Swal.fire({
      title: 'Confirmação',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      confirmButtonColor: '#d33', // Red color for danger confirmation button
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => result.isConfirmed);
  }
  

  // Custom Form Alert for Service Selection
  async function confirmeServiceReport() {
    const { value: formValues } = await Swal.fire({
      title: 'Selecionar Serviço por imprimir',
      html: `
        <div class="q-pa-md">
          <input type="checkbox" id="tarvCheckbox">
          <label for="tarvCheckbox">TARV</label>
          <br>
          <input type="checkbox" id="tbCheckbox">
          <label for="tbCheckbox">TB</label>
          <br>
          <input type="checkbox" id="smiCheckbox">
          <label for="smiCheckbox">SMI</label>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          tarv: (document.getElementById('tarvCheckbox') as HTMLInputElement)?.checked || false,
          tb: (document.getElementById('tbCheckbox') as HTMLInputElement)?.checked || false,
          smi: (document.getElementById('smiCheckbox') as HTMLInputElement)?.checked || false,
        };
      },
    });

    if (formValues) {
      Swal.fire({
        title: 'Selecionado',
        text: `TARV: ${formValues.tarv}, TB: ${formValues.tb}, SMI: ${formValues.smi}`,
        icon: 'info',
      });
    }
  }

  return {
    alertSucess,
    alertWarning,
    alertError,
    alertInfo,
    alertWarningAction,
    alertSucessAction,
    alertWarningTitle,
    confirmeServiceReport,
  };
}

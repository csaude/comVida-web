// src/composables/shared/dialog/dialog.ts
import Swal, { type SweetAlertOptions } from 'sweetalert2'

const DEFAULT_Z = 12000
const CONTAINER_CLASS = 'swal2-on-top'

function withStack(opts: SweetAlertOptions = {}): SweetAlertOptions {
  // Merge options and ensure container gets a high z-index
  const merged: SweetAlertOptions = {
    ...opts,
    customClass: {
      container: CONTAINER_CLASS,
      ...(opts.customClass || {})
    },
    didOpen: (el: HTMLElement) => {
      // push container above Quasar overlays
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(DEFAULT_Z)

      // preserve user-provided didOpen
      if (typeof opts.didOpen === 'function') opts.didOpen(el)
    }
  }
  return merged
}

export function useSwal() {
  function alertSucess(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Sucesso',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      ...opts
    }))
  }

  function alertSucessAction(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Sucesso',
      text: message,
      icon: 'success',
      showCancelButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      allowOutsideClick: false,
      allowEscapeKey: false,
      ...opts
    }))
  }

  function alertWarningTitle(title: string, message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok',
      ...opts
    }))
  }

  function alertWarning(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Aviso',
      text: message,
      icon: 'warning',
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: 'Ok',
      ...opts
    }))
  }

  function alertError(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Erro',
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
      ...opts
    }))
  }

  function alertInfo(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Informação',
      text: message,
      icon: 'info',
      confirmButtonText: 'Ok',
      ...opts
    }))
  }

  function alertWarningAction(message: string, opts?: SweetAlertOptions) {
    return Swal.fire(withStack({
      title: 'Confirmação',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      confirmButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: false,
      ...opts
    })).then(res => res.isConfirmed)
  }

  async function confirmeServiceReport(opts?: SweetAlertOptions) {
    const { value: formValues } = await Swal.fire(withStack({
      title: 'Selecionar Serviço por imprimir',
      html: `
        <div class="q-pa-md">
          <input type="checkbox" id="tarvCheckbox">
          <label for="tarvCheckbox">TARV</label><br>
          <input type="checkbox" id="tbCheckbox">
          <label for="tbCheckbox">TB</label><br>
          <input type="checkbox" id="smiCheckbox">
          <label for="smiCheckbox">SMI</label>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => ({
        tarv: (document.getElementById('tarvCheckbox') as HTMLInputElement)?.checked || false,
        tb: (document.getElementById('tbCheckbox') as HTMLInputElement)?.checked || false,
        smi: (document.getElementById('smiCheckbox') as HTMLInputElement)?.checked || false
      }),
      ...opts
    }))

    if (formValues) {
      await Swal.fire(withStack({
        title: 'Selecionado',
        text: `TARV: ${formValues.tarv}, TB: ${formValues.tb}, SMI: ${formValues.smi}`,
        icon: 'info'
      }))
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
    confirmeServiceReport
  }
}
